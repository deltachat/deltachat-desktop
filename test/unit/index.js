const test = require('tape')
const fs = require('fs')
const path = require('path')

test('that translation files are valid json', t => {
  const dir = path.join(__dirname, '../../_locales')
  fs.readdir(dir, (err, files) => {
    t.error(err, 'no error reading folder')
    files.forEach(filename => {
      if (path.extname(filename) === '.json') {
        const fullPath = path.join(dir, filename)
        try {
          require(fullPath)
          t.pass(`${fullPath} valid json`)
        } catch (e) {
          t.fail(`${fullPath} invalid json`)
          console.error(e)
        }
      }
    })
    t.end()
  })
})
