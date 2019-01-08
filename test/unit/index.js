const test = require('tape')
const fs = require('fs')
const path = require('path')

test('that translation files are valid json', t => {
  const dir = path.join(__dirname, '../../_locales')
  fs.readdir(dir, (err, files) => {
    t.error(err, 'no error reading folder')
    const xmlFiles = files.filter(f => path.extname(f) === '.xml')
    const jsonFiles = files.filter(f => path.extname(f) === '.json')
    const name = f => f.split('.')[0]
    t.deepEqual(
      xmlFiles.map(name),
      jsonFiles.map(name),
      'each xml file has a corresponding json file'
    )
    t.is(
      jsonFiles.every(f => {
        let ok = false
        const fullPath = path.join(dir, f)
        try {
          require(fullPath)
          ok = true
        } catch (e) {
          console.error(e)
        }
        return ok
      }),
      true,
      'json is valid'
    )
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
    },
    'test_c': {
      other: '%n foo',
      one: '1 foo'
    }
  })

  t.equal(translate('test_a', ['asd', 'dsa']), 'foo asd dsa blubb')
  t.equal(translate('test_b', ['asd', 'dsa']), 'fo2o asd dsa blu2bb')
  t.equal(translate('test_b'), 'fo2o %s %d blu2bb')
  t.equal(translate('test_c', null, 'one'), '1 foo')
  t.equal(translate('test_c', 10, 'other'), '10 foo')

  t.end()
})
