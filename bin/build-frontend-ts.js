//@ts-check
const child = require('child_process')
const { readFile, writeFile } = require('fs/promises')
/**
 *
 * @param {string[]} args arguments for the command
 * @param {import('child_process').SpawnOptionsWithoutStdio} [options]
 */
async function run(command, args, options, listener = undefined) {
  return new Promise((resolve, reject) => {
    console.log(`- Executing "${command} ${args.join(' ')}"`)
    const p = child.spawn(command, args, {
      shell: true,
      cwd: process.cwd(),
      ...options,
    })
    p.stdout.pipe(process.stdout)
    if (listener) {
      p.stdout.on('data', listener)
    }
    p.stderr.pipe(process.stderr)
    p.on('close', resolve)
    p.on('error', reject)
    p.on('exit', code => {
      if (code != 0) {
        console.log(command + 'exited with ERR CODE ' + code)
        reject('ERR CODE ' + code)
      }
    })
    process.on('beforeExit', () => {
      p.kill('SIGKILL')
    })
  })
}

async function bundle(production, minify = false) {
  const bundleArgs = [
    'esbuild',
    'src/renderer/main.tsx',
    '--bundle',
    ...(minify ? ['--minify'] : []),
    '--sourcemap',
    '--outfile=html-dist/bundle.js',
    production
      ? '--define:process.env.NODE_ENV=\\"production\\"'
      : '--define:process.env.NODE_ENV=\\"development\\"',
  ]

  await run('npx', bundleArgs)
}

async function main(watch_ = false, production_, minify_ = false) {
  let watchTscProcess = Promise.resolve()

  const watch = watch_
  const production = !watch && production_
  const minify = (!watch && minify_) || production

  watch && console.log('- First Compile...')
  !watch && console.log('- Compile esbuild ...')
  await bundle(production, minify)

  if (watch) {
    // TODO remove typescript watch and watch files directly
    let isBundling = false
    let isScheduled = false

    const BundleIfNeeded = () => {
      if (isBundling) {
        isScheduled = true
      } else {
        isBundling = true
        bundle(false)
          .then(() => {
            console.log('- bundling done')
            isBundling = false
            if (isScheduled) {
              isScheduled = false
              BundleIfNeeded()
            }
          })
          .catch(console.log.bind(null, 'bundling failed'))
      }
    }

    /** @type {(chunk:Buffer)=>void} chunk */
    const TSCoutput = chunk => {
      if (
        chunk
          .toString()
          .indexOf('Found 0 errors. Watching for file changes.') !== -1
      ) {
        BundleIfNeeded()
      }
    }

    watchTscProcess = run(
      'npx',
      'tsc -b src/renderer --pretty -w --preserveWatchOutput'.split(' '),
      {},
      TSCoutput
    )
  } else {
    console.log('- build completed')
  }

  await Promise.all([watchTscProcess])
}

// console.log(process.argv.indexOf('-w'))
const watch = process.argv.indexOf('-w') !== -1
const minify = process.argv.indexOf('-m') !== -1

main(watch, process.env['NODE_ENV'] === 'production', minify).catch(err => {
  console.error(err)
  process.exitCode = 1
})
