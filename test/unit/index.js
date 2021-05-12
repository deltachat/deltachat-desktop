const test = require('tape')
const fs = require('fs')
const path = require('path')

test('that translation files are valid json', t => {
  const dir = path.join(__dirname, '../../_locales')
  fs.readdir(dir, (err, files) => {
    t.error(err, 'no error reading folder')
    const xmlFiles = files.filter(f => path.extname(f) === '.xml')
    const jsonFiles = files.filter(
      f =>
        path.extname(f) === '.json' &&
        path.basename(f) !== '_languages.json' &&
        path.basename(f) !== '_untranslated_en.json'
    )
    const name = f => f.split('.')[0]
    t.deepEqual(
      xmlFiles.map(name),
      jsonFiles.map(name),
      'each xml file has a corresponding json file'
    )
    const testFile = file => {
      let json = null
      try {
        json = require(file)
      } catch (e) {
        console.error(e.message)
        return false
      }
      return Object.keys(json).every(k1 => {
        const v1 = json[k1]
        return Object.keys(v1).every(k2 => {
          const v2 = v1[k2]
          if (typeof v2 !== 'string') {
            console.error(
              `> ${JSON.stringify(v2)} not a string (${file} -> ${k1} -> ${k2})`
            )
            return false
          }

          function testString(str) {
            const regex = new RegExp(str, 'g')
            const match = regex.exec(v2)
            if (match) {
              console.error(
                `> ${JSON.stringify(
                  v2
                )} contains ${str} (${file} -> ${k1} -> ${k2}) (index: ${
                  match.index
                })`
              )
              return false
            }
            return true
          }

          if (!testString('\\\\n')) return false
          if (!testString("\\\\'")) return false
          if (!testString('\\\\\\"')) return false
          // if (!testString('\\\\')) return false

          return true
        })
      })
    }
    t.is(
      jsonFiles.every(f => testFile(path.join(dir, f))),
      true,
      'valid json and valid strings'
    )
    t.end()
  })
})

test('test translation method', t => {
  const l = require('../../tsc-dist/shared/localize')
  const translate = l.translate({
    test_a: {
      message: 'foo %1$s %2$s blubb',
    },
    test_b: {
      message: 'fo2o %s %d blu2bb',
    },
    test_c: {
      other: '%n foo',
      one: '1 foo',
    },
  })

  t.equal(translate('test_a', ['asd', 'dsa']), 'foo asd dsa blubb')
  t.equal(translate('test_b', ['asd', 'dsa']), 'fo2o asd dsa blu2bb')
  t.equal(translate('test_b'), 'fo2o %s %d blu2bb')
  t.equal(translate('test_c', null, 'one'), '1 foo')
  t.equal(translate('test_c', 10, 'other'), '10 foo')

  t.end()
})

test('mailto-parsing', t => {
  const { parseMailto } = require('../../tsc-dist/shared/parse_mailto')

  t.deepEqual(parseMailto('mailto:ex@example.com?body=hello'), {
    to: 'ex@example.com',
    subject: undefined,
    body: 'hello',
  })
  t.deepEqual(parseMailto('mailto:ex@example.com?body=hello&subject=hi'), {
    to: 'ex@example.com',
    subject: 'hi',
    body: 'hello',
  })
  t.deepEqual(parseMailto('mailto:?body=hello&subject=hi'), {
    to: null,
    subject: 'hi',
    body: 'hello',
  })
  t.deepEqual(parseMailto('mailto:?body=hello'), {
    to: null,
    subject: undefined,
    body: 'hello',
  })
  t.deepEqual(parseMailto('mailto:?body=hello%20world'), {
    to: null,
    subject: undefined,
    body: 'hello world',
  })
  // unescaped
  t.deepEqual(
    parseMailto('mailto:deltabot@example.com?body=/web+https://github.com/'),
    {
      to: 'deltabot@example.com',
      subject: undefined,
      body: '/web https://github.com/',
    }
  )

  t.end()
})
