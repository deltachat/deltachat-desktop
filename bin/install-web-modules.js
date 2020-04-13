#!/usr/bin/env node

import fsExtra from 'fs-extra'
import {  join } from 'path'

/**
 * This function tries to resolve the path to the ESM module file 
 * of an installed node package
 * @param {string} nodeModule - name of node module, for example "preact"
 * @returns {string|boolean}  - returns path to esm file or false 
 */
export async function resolveESMFile(nodeModule) {
    const pathModule = join('./', 'node_modules', nodeModule)
    const pathPackageJSON = join(pathModule, 'package.json')

    let packageJSON 
    try {
        packageJSON = await fsExtra.readJSON(pathPackageJSON)
    } catch (err) {
        console.error(`- can't open "${pathPackageJSON}". Is the module "${nodeModule}" installed?`)
        return false
    }
    
    if (!packageJSON.module) return false
    return join(pathModule, packageJSON.module)
}

async function main() {
    let options = {
        showHelp: false,
        pathWebModules: false,
        modules: []
    }

    for(let i = 2; i < process.argv.length; i++) {
        let arg = process.argv[i]
        if (arg === "--help" || arg === "-h") {
            options.showHelp = true
            break
        } else if (options.pathWebModules === false) {
            options.pathWebModules = arg
        } else {
            options.modules.push(arg)
        }
    }

    if (process.argv.length === 2) options.showHelp = true

    if (options.showHelp) {
        console.log(`install-web-modules.js [OPTIONS] webmodulepath module1 [module2]

This tool installs the ESM dist files of a node module to the web_module path.

Options:
--help  | -h       Show this help

Example: 
  ./bin/install-web-modules.js ./dist/js/web_modules preact jquery mapboxgl`)
        return
    } else if (options.pathWebModules === false) {
        console.error("- you need to specify the path to where the ESM files should get copied to as the first argument. See --help for more details.")
    } else if (options.modules.length === 0) {
        console.error("- no modules specified. See --help for more details.")
    } else {
        await fsExtra.ensureDir(options.pathWebModules)

        let error_count = 0
        for (let m of options.modules) {
            let esmFile = await resolveESMFile(m)
            if (esmFile === false) {
                console.error(`- the module "${m}" is not a valid ESM module :/`)
                error_count++
                continue
            }
            await fsExtra.copy(esmFile, join(options.pathWebModules, m + '.js'))
            console.log(`+ installed "${m}"`)
        }
    
        if (error_count > 0) console.error(`- Could not install ${error_count} package(s)`)
    }
}
    
main()