import arg from 'arg';
import { getHelpMenu } from './help_menu.js';

var pjson = require('../../package.json');

function parseArgumentsIntoOptions(rawArgs) {
    const args = arg (
        {
            "--help" : Boolean,
            "--version" : Boolean,
            "-h" : "--help",
            "-v" : "--version",
        },
        {
            argv: rawArgs.slice(2),
        }
    );

    return {
        version: args["--version"] || false,
        help: args["--help"] || false
    }
}

export async function cli(args) {
    let options = parseArgumentsIntoOptions(args);
    if (options.version) {
        console.log(pjson.version);
    }
    if(options.help) {
        getHelpMenu();
    }
    
}