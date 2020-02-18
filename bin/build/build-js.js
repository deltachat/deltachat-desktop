const child = require('child_process')
const { join } = require('path')
const fs = require('fs-extra')
/**
 * 
 * @param {boolean} watch 
 * @param {boolean} sourcemap 
 */
async function jsBuilder(watch, sourcemap) {
    if (watch) {
        console.error("jsBuilder: Watch is not implemented yet")
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
        '--target', 'electron'
    ]
    if(!sourcemap) parcelArgs.push('--no-source-maps')
    await run('npx', parcelArgs)
    console.log('Parcel (bundle + minification) completed')

    if(sourcemap){
        // fix source maps
        const source_map = await fs.readJSON('./html-dist/bundle.js.map')
        source_map.sources = source_map.sources.map((source) => {
            return source.replace(/\.\.\//g, '')
        })
        source_map.sourceRoot = '../'
    
        await fs.writeJSON('./html-dist/bundle.js.map', source_map)
    }
}

/**
 * 
 * @param {string[]} args arguments for the command
 */
async function run(command, args) {
    return new Promise((resolve, reject) => {
        const p = child.spawn(command, args)
        p.stdout.pipe(process.stdout)
        p.stderr.pipe(process.stderr)
        p.on('close', resolve)
        p.on('error', reject)
    })
}

module.exports = { jsBuilder }