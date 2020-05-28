#!/usr/bin/env node

const fsExtra = require('fs-extra')
const fs = require('fs')
const {  resolve, join } = require('path')
const globWatcher = require('glob-watcher')

async function copy(source, destination, watch=false) {
    await fsExtra.ensureDir(destination)

    fs.readdir(source, async (err, files) => {
        if (err) return console.error('- Unable to scan directory: ' + err);
        for (let f of files) {
            const pathSource = join(source, f)
            const pathDestination = join(destination, f)
            try {
                await fsExtra.copy(pathSource, pathDestination)
            } catch(err) {
                console.error(`- Couldn't copy "${pathSource}" -> "${pathDestination}" because of:\n  ${err}`)
            }
        }
    })

    console.log(`+ copied all source files to "${destination}"`)

    if(watch === true) {
        const watcher = globWatcher([join(source, '*')], () => {
            console.log(`+ files changed in "${source}"`)
            copy(source, destination, false)
        })
        console.log('+ watching for file changes...')
    }
}


function main() {
    let options = {
        showHelp: false,
        watch: false,
        source: false,
        destination: false
    }

    for(let i = 2; i < process.argv.length; i++) {
        let arg = process.argv[i]
        if (arg === "--help" || arg === "-h") {
            options.showHelp = true
            break
        } else if (arg == "--watch" || arg === "-w") {
            options.watch = true
        } else if (options.source === false) {
            options.source = arg
        } else if (options.destination === false) {
            options.destination = arg
        } else {
            console.error('- Unknown arguments. Please see help.')
        }
    }

    if(options.showHelp) {
        console.log(`copy-files.js <source> <destination> [OPTIONS]
Source is the source folder from where this tool should copy all files to destination.
It will copy all files & folders INSIDE the source folder to the destination folder.
Options:
--help  | -h       Show this help
--watch | -w       Watch for file changes`)
        return
    } else if(options.source === false) {
      return console.error("- no source folder specified. See --help.")
    } else if(options.destination === false) {
      return console.error("- no destination folder specified. See --help.")
    } else {
      copy(options.source, options.destination, options.watch)
    }
}

main()
