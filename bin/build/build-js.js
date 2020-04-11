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

  // note we can't turn off sourcemaps for tsc -b (without modifing the tsconfig file)
  await run('npx', `tsc -b src/renderer --pretty`.split(' '))
  console.log('TS compile completed')

  const parcelArgs = [
    'parcel', 'build', 'tsc-dist/renderer/main.js',
    '--out-dir', 'html-dist',
    '--out-file', 'bundle.js',
    '--public-url', './',
    '--target', 'browser'
  ]
  const parcelENV = {}

  if (!sourcemap) parcelArgs.push('--no-source-maps')
  if (dev) {
    parcelArgs.push('--no-minify')
    parcelENV['NODE_ENV'] = 'development'
  }

  await run('npx', parcelArgs)
  console.log('Parcel (bundle + minification) completed')

  if (sourcemap) {
    // fix source maps
    const sourceMap = await fs.readJSON('./html-dist/bundle.js.map')
    sourceMap.sources = sourceMap.sources.map((source) => {
      // fix path depth & move all non renderer souces to .ignore folder
      return (source.indexOf('src/renderer') > -1) ? source.replace(/\.\.\//g, '') : source.replace(/\.\.\//g, '.ignore/')
    })
    sourceMap.sourceRoot = '../'

    await fs.writeJSON('./html-dist/bundle.js.map', sourceMap)
  }
}

/**
 *
 * @param {string[]} args arguments for the command
 */
async function run (command, args) {
  return new Promise((resolve, reject) => {
    const p = child.spawn(command, args)
    p.stdout.pipe(process.stdout)
    p.stderr.pipe(process.stderr)
    p.on('exit', (err) => {
      if (err) {
        reject('running "' + command + ' ' + args.join(' ') + '" failed')
      } else {
        resolve()
      }
    })
  })
}

module.exports = { jsBuilder }
