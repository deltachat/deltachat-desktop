import converter from 'xml-js'
import path from 'path'
import fs from 'fs'

const __dirname = path.dirname(new URL(import.meta.url).pathname);

const LOCALES_DIR = path.join(__dirname, '..', '_locales')

const start = Date.now()
process.stdout.write('Converting translations from xml to json... ')
fs.readdir(LOCALES_DIR, (err, files) => {
  if (err) throw err
  const xmlFiles = files.filter(filename => path.extname(filename) === '.xml')
  xmlFiles
    .map(filename => path.resolve(LOCALES_DIR, filename))
    .forEach(xmlToJson)
  const time = Date.now() - start
  process.stdout.write(`(converted ${xmlFiles.length} files in ${time} ms)\n`)
})

function xmlToJson (filename) {
  const xml = fs.readFileSync(filename, 'utf-8').toString()

  try {
    var js = converter.xml2js(xml, { compact: true })
  } catch (err) {
    console.error('Error converting translation file:', filename)
    throw err
  }

  const res = {}

  function error (val) {
    // a single malformed translation won't render the whole build useless
    console.error('Invalid attribute', JSON.stringify(val, null, 2))
  }

  function done () {
    const newFile = filename.replace(path.extname(filename), '') + '.json'
    fs.writeFileSync(newFile, JSON.stringify(res, null, 2))
  }

  if (!js.resources || !js.resources.string || !js.resources.plurals) return done()

  js.resources.string.forEach((string) => {
    const name = string._attributes.name
    if (!name) return error(string)
    let text = string._text
    if (typeof text === 'string') {
      text = text.replace(new RegExp('\\\\n', 'g'), '\n')
      text = text.replace(new RegExp("\\\\'", 'g'), "'")
      text = text.replace(new RegExp('\\\\\\"', 'g'), '"')
      text = text.replace(new RegExp('\\\\', 'g'), '')
    }
    res[name] = {
      message: text
    }
  })

  js.resources.plurals.forEach((plural) => {
    const name = plural._attributes.name
    if (!name) return error(plural)

    if (!Array.isArray(plural.item)) plural.item = [plural.item]

    const items = {}

    plural.item.forEach((i) => {
      const quantity = i._attributes.quantity
      if (!quantity) return error(plural)
      items[quantity] = i._text
    })
    res[name] = items
  })
  done()
}
