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

test('test translation method', t => {
  const l = require('../../src/localize')
  const translate = l.translate({
    'test_a': {
      message: 'foo %1$s %2$s blubb'
    },
    'test_b': {
      message: 'fo2o %s %d blu2bb'
    }
  })

  t.equal(translate('test_a', ['asd', 'dsa']), 'foo asd dsa blubb')
  t.equal(translate('test_b', ['asd', 'dsa']), 'fo2o asd dsa blu2bb')
  t.end()
})
