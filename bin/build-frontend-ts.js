const child = require('child_process')
const fs = require('fs-extra')

/**
 *
 * @param {string[]} args arguments for the command
 * @param {import('child_process').SpawnOptionsWithoutStdio} options
 */
async function run(command, args, options) {
  return new Promise((resolve, reject) => {
    console.log(`- Executing "${command} ${args.join(' ')}"`)
    const p = child.spawn(command, args, { shell: true, ...options })
    p.stdout.pipe(process.stdout)
    p.stderr.pipe(process.stderr)
    p.on('close', resolve)
    p.on('error', reject)
    p.on('exit', code => {
      if (code != 0) {
        console.log(command + 'exited with ERR CODE ' + code)
        reject('ERR CODE ' + code)
      }
    })
  })
}

async function main({ watch, sourcemap }) {
  if (watch === false) {
    console.log('- Compiling TypeScript...')
    await run('npx', 'tsc -b src/renderer --pretty'.split(' '))
    console.log('- Finished compiling TypeScript...')
  } else {
    console.log('- Watch is enabled')
    run(
      'npx',
      'tsc -b src/renderer --pretty -w --preserveWatchOutput'.split(' ')
    )
  }

  const bundleArgs = [
    'esbuild',
    'tsc-dist/renderer/main.js',
    '--bundle',
    '--outfile=html-dist/bundle.js',
  ]
  let minify = false

  if (sourcemap) bundleArgs.push('--sourcemap')
  if (process.env['NODE_ENV'] !== 'production' && !watch) {
    bundleArgs.push('--define:process.env.NODE_ENV=\\"development\\"')
  } else {
    minify = true
    bundleArgs.push('--define:process.env.NODE_ENV=\\"production\\"')
  }

  console.log('- Bundling with esbuild...')
  await run('npx', bundleArgs)

  if (minify) {
    console.log('- Minify with terser...')
    await run('npx', [
      'terser',
      '--compress',
      '--mangle',
      '--source-map',
      '"content=\'html-dist/bundle.js.map\'"',
      'html-dist/bundle.js',
      '--output',
      'html-dist/bundle.js',
    ])
  }

  console.log('- build completed')

  // if (sourcemap) {
  //   // fix source maps
  //   const sourceMap = await fs.readJSON('./html-dist/bundle.js.map')
  //   sourceMap.sources = sourceMap.sources.map(source =>
  //     // fix path depth & move all non renderer souces to .ignore folder
  //     -(source.indexOf('src/renderer') > -1)
  //       ? source.replace(/\.\.\//g, '')
  //       : source.replace(/\.\.\//g, '.ignore/')
  //   )
  //   sourceMap.sourceRoot = '../'

  //   await fs.writeJSON('./html-dist/bundle.js.map', sourceMap)
  // }
}

// console.log(process.argv.indexOf('-w'))
const watch = process.argv.indexOf('-w') !== -1

main({ watch, sourcemap: true }).catch(error => {
  if (!watch) process.exit(1)
})
