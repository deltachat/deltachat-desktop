const converter = require('xml-js')
const path = require('path')
const fs = require('fs')
const globWatcher = require('glob-watcher')

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

function convertTranslationsFromXMLToJSON(pathLocales, watch=false) {
  const start = Date.now()
  console.log('+ Converting translations from xml to json... ')
  
  let count_converted = 0
  fs.readdir(pathLocales, (err, files) => {
    if (err) throw err
    for(let f of files) {
      if (path.extname(f) !== '.xml') continue
      const pathXml = path.join(pathLocales, f)
      xmlToJson(pathXml)
      count_converted++
    }
    const time = Date.now() - start
    console.log(`+ converted ${count_converted} files in ${time} ms\n`)
  })

  
  if(watch === true) {
      const watcher = globWatcher([path.join(pathLocales, '*.xml')], () => {
          console.log(`+ files changed in "${source}"`)
          convertTranslationsFromXMLToJSON(false)
      })
      console.log('+ watching for file changes...')
  }
}

function main() {
    let options = {
        showHelp: false,
        watch: false,
        pathLocales: false,
    }

    for(let i = 2; i < process.argv.length; i++) {
        let arg = process.argv[i]
        if (arg === "--help" || arg === "-h") {
            options.showHelp = true
            break
        } else if (arg == "--watch" || arg === "-w") {
            options.watch = true
        } else if (options.pathLocales === false) {
            options.pathLocales = arg
        } else {
            console.error('- Unknown arguments. Please see help.')
        }
    }

    if(options.showHelp) {
        console.log(`build-translations.js <localepath> [OPTIONS]

This scripts translates all the locale files downloaded/pulled from transifex
which are in the .xml format into a .json version.

Examples:
- ./bin/build-translations ./_locales
- ./bin/build-translations ./_locales -w

Options:
--help  | -h       Show this help
--watch | -w       Watch for file changes`)
        return
    } else if(options.pathLocales === false) {
      return console.error("- no <localepath> folder specified. See --help.")
    } else {
      convertTranslationsFromXMLToJSON(options.pathLocales, options.watch)
    }
}

main()
