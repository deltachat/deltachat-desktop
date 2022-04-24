import { describe } from 'mocha'
import { expect, assert } from 'chai'
import fs from 'fs'
import path from 'path'
import { translate } from '../../../src/shared/localize'

describe('/shared/localize', () => {
  // the tests container
  it('translation files should be valid json', () => {
    // the single test
    const dir = path.join(__dirname, '../../../_locales')
    fs.readdir(dir, (err, files) => {
      if (err) {
        assert.fail('no error reading folder')
      }
      const xmlFiles = files.filter(f => path.extname(f) === '.xml')
      const jsonFiles = files.filter(
        f =>
          path.extname(f) === '.json' &&
          path.basename(f) !== '_languages.json' &&
          path.basename(f) !== '_untranslated_en.json'
      )
      const name = (f: string) => f.split('.')[0]
      expect(xmlFiles.map(name)).to.deep.eq(jsonFiles.map(name))
      const testFile = (file: string) => {
        let json: any = null
        try {
          json = require(file)
        } catch (e: any) {
          console.error(e.message)
          return false
        }
        return Object.keys(json).every(k1 => {
          const v1 = json[k1]
          return Object.keys(v1).every(k2 => {
            const v2 = v1[k2]
            if (typeof v2 !== 'string') {
              console.error(
                `> ${JSON.stringify(
                  v2
                )} not a string (${file} -> ${k1} -> ${k2})`
              )
              return false
            }

            function testString(str: string) {
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
      expect(jsonFiles.every(f => testFile(path.join(dir, f)))).to.eq(true)
    })
  })

  it('translations methods should work as expected', () => {
    const tx = translate({
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

    expect(tx('test_a', ['asd', 'dsa'])).to.eq('foo asd dsa blubb')
    expect(tx('test_b', ['asd', 'dsa'])).to.eq('fo2o asd dsa blu2bb')
    expect(tx('test_b')).to.eq('fo2o %s %d blu2bb')
  })
})
