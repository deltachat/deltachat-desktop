import child from 'child_process'
import fs from 'fs-extra'
/**
 *
 * @param {boolean} watch
 * @param {boolean} sourcemap
 */
export async function jsBuilder (watch, sourcemap, dev) {
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
    sourceMap.sources = sourceMap.sources.map((source) => 
      // fix path depth & move all non renderer souces to .ignore folder
-     (source.indexOf('src/renderer') > -1) ? source.replace(/\.\.\//g, '') : source.replace(/\.\.\//g, '.ignore/')
    )
    sourceMap.sourceRoot = '../'

    await fs.writeJSON('./html-dist/bundle.js.map', sourceMap)
  }
}

/**
 *
 * @param {string[]} args arguments for the command
 * @param {import('child_process').SpawnOptionsWithoutStdio} options
 */
export async function run (command, args, options) {
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
