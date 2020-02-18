var child = require('child_process')
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

    await run('npx', `tsc -b src/renderer --pretty`.split(' '))
    console.log('TS compile completed')

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