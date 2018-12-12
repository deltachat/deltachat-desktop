const converter = require('xml-js')
const path = require('path')
const fs = require('fs')

var LOCALES_DIR = path.join(__dirname, '..', '_locales')
console.log('Converting translations from xml to json...')
fs.readdir(LOCALES_DIR, (err, filenames) => {
  if (err) throw err
  filenames.forEach(xmlToJson)
})

function xmlToJson (filename) {
  filename = path.resolve(LOCALES_DIR, filename)
  var xml = fs.readFileSync(filename, 'utf-8').toString()
  var js = converter.xml2js(xml, { compact: true })
  var res = {}

  function error (val) {
    // a single malformed translation won't render the whole build useless
    console.error('Invalid attribute', JSON.stringify(val, null, 2))
  }

  function done () {
    var newFile = filename.replace(path.extname(filename), '') + '.json'
    console.log('Writing', newFile)
    fs.writeFileSync(newFile, JSON.stringify(res, null, 2))
  }

  if (!js.resources || !js.resources.string || !js.resources.plurals) return done()

  js.resources.string.forEach((string) => {
    var name = string._attributes.name
    if (!name) return error(string)
    res[name] = {
      'message': string._text
    }
  })

  js.resources.plurals.forEach((plural) => {
    var name = plural._attributes.name
    if (!name) return error(plural)
    var items = {}
    plural.item.forEach((i) => {
      var quantity = i._attributes.quantity
      if (!quantity) return error(plural)
      items[quantity] = i._text
    })
    res[name] = items
  })
  done()
}
