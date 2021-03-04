const fs = require('fs')
const path = require('path')

const browserSourceMapSupportPath = path.join(__dirname, '..', 'node_modules', 'source-map-support', 'browser-source-map-support.js')
fs.copyFileSync(browserSourceMapSupportPath, path.join(__dirname, '..', 'html-dist', 'browser-source-map-support.js'))
