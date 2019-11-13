const { join } = require('path')
const fs = require('fs')
const appConfig = join(__dirname, '../src/application-config.js')

const action = process.argv[2] === 'undo' ? 'undo' : 'do'

const fileContent = fs.readFileSync(appConfig, 'utf-8')
  .replace(
    /const portable = (?:false|true)/,
    `const portable = ${JSON.stringify(action === 'do')}`
  )

fs.writeFileSync(appConfig, fileContent)
