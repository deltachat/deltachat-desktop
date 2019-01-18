const fs = require('fs')
const path = require('path')

let packageJson = require('../package.json')
delete packageJson['build']
packageJson.main = 'index.js'

fs.writeFileSync(path.join(__dirname, '..', 'build', 'package.json'), JSON.stringify(packageJson))
