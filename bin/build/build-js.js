const child = require('child_process')
const fs = require('fs-extra')
/**
 *
 * @param {boolean} watch
 * @param {boolean} sourcemap
 */
async function jsBuilder (watch, sourcemap, dev) {
  if (watch) {
    console.error('jsBuilder: Watch is not implemented yet')
    return
  }

  // note we can't turn of sourcemaps for tsc -b (without modifing the tsconfig file)
  await run('npx', `tsc -b src/renderer --pretty`.split(' '))
  console.log('TS compile completed')

  const parcelArgs = [
    'parcel', 'build', 'tsc-dist/renderer/main.js',
    '--out-dir', 'html-dist',
    '--out-file', 'bundle.js',
    '--public-url', './',
    '--target', 'browser'
  ]
  const parcelENV = Object.assign({}, process.env)

  if (!sourcemap) parcelArgs.push('--no-source-maps')
  if (dev) {
    parcelArgs.push('--no-minify')
    parcelENV['NODE_ENV'] = 'development'
  } else {
    parcelENV['NODE_ENV'] = 'production'
  }

  await run('npx', parcelArgs, {env:parcelENV})
  console.log('Parcel (bundle + minification) completed')

  if (sourcemap) {
    // fix source maps
    const sourceMap = await fs.readJSON('./html-dist/bundle.js.map')
    sourceMap.sources = sourceMap.sources.map((source) => {
      return source.replace(/\.\.\//g, '')
    })
    sourceMap.sourceRoot = '../'

    await fs.writeJSON('./html-dist/bundle.js.map', sourceMap)
  }
}

/**
 *
 * @param {string[]} args arguments for the command
 * @param {import('child_process').SpawnOptionsWithoutStdio} options
 */
async function run (command, args, options) {
  return new Promise((resolve, reject) => {
    const p = child.spawn(command, args, options)
    p.stdout.pipe(process.stdout)
    p.stderr.pipe(process.stderr)
    p.on('close', resolve)
    p.on('error', reject)
    p.on('exit', (code)=>{
      if (code != 0) {
        console.log(command + 'exited with ERR CODE '+ code)
        reject('ERR CODE '+ code)
      }
    })
  })
}

module.exports = { jsBuilder }
