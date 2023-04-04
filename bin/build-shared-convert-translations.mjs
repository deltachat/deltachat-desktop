//@ts-check
import { xml2js } from 'xml-js'
import { extname, join } from 'path'
import chokidar from 'chokidar'
import { readdir, readFile, writeFile } from 'fs/promises'

function removeJunk(input) {
  return input
    .replace(new RegExp('\\\\n', 'g'), '\n')
    .replace(new RegExp("\\\\'", 'g'), "'")
    .replace(new RegExp('\\\\\\"', 'g'), '"')
    .replace(new RegExp('\\\\', 'g'), '')
}

async function xmlToJson(filename) {
  const xml = (await readFile(filename, 'utf-8')).toString()

  try {
    /** @type {any} */
    var js = xml2js(xml, { compact: true })
  } catch (err) {
    console.error('Error converting translation file:', filename)
    throw err
  }

  const res = {}

  function error(val) {
    // a single malformed translation won't render the whole build useless
    console.error('Invalid attribute', JSON.stringify(val, null, 2))
  }

  async function done() {
    const newFile = filename.replace(extname(filename), '') + '.json'
    await writeFile(newFile, JSON.stringify(res, null, 2))
  }

  if (!js.resources || !js.resources.string || !js.resources.plurals)
    return done()

  js.resources.string.forEach(string => {
    const name = string._attributes.name
    if (!name) return error(string)
    let text = string._text
    if (typeof text === 'string') {
      text = removeJunk(text)
    }
    res[name] = {
      message: text,
    }
  })

  js.resources.plurals.forEach(plural => {
    const name = plural._attributes.name
    if (!name) return error(plural)

    if (!Array.isArray(plural.item)) plural.item = [plural.item]

    const items = {}

    plural.item.forEach(i => {
      const quantity = i._attributes.quantity
      if (!quantity) return error(plural)
      items[quantity] = removeJunk(i._text)
    })
    res[name] = items
  })
  done()
}

async function convertTranslationsFromXMLToJSON(pathLocales, watch = false) {
  const start = Date.now()
  console.log('+ Converting translations from xml to json... ')

  let count_converted = 0

  for (let f of await readdir(pathLocales)) {
    if (extname(f) !== '.xml') continue
    const pathXml = join(pathLocales, f)
    await xmlToJson(pathXml)
    count_converted++
  }
  const time = Date.now() - start
  console.log(`+ converted ${count_converted} files in ${time} ms\n`)

  if (watch === true) {
    const watcher = chokidar.watch(join(pathLocales, '*.xml'), {
      persistent: true,
    })

    watcher.on('ready', () => {
      watcher.on('all', (type, path) => {
        console.log(`+ a file changed: ${path} what: ${type}`)
        const start = Date.now()
        xmlToJson(path).then(() => {
          const time = Date.now() - start
          console.log(`converted ${path} in ${time}ms`)
        })
      })
      console.log('+ watching for file changes...')
    })
  }
}

function main() {
  let options = {
    showHelp: false,
    watch: false,
    /** @type {string|false} */
    pathLocales: false,
  }

  for (let i = 2; i < process.argv.length; i++) {
    let arg = process.argv[i]
    if (arg === '--help' || arg === '-h') {
      options.showHelp = true
      break
    } else if (arg == '--watch' || arg === '-w') {
      options.watch = true
    } else if (options.pathLocales === false) {
      options.pathLocales = arg
    } else {
      console.error('- Unknown arguments. Please see help.')
    }
  }

  if (options.showHelp) {
    console.log(`build-translations.js <localepath> [OPTIONS]
This scripts translates all the locale files downloaded/pulled from transifex
which are in the .xml format into a .json version.
Examples:
- node ./bin/build-shared-convert-translations.mjs ./_locales
- node ./bin/build-shared-convert-translations.mjs ./_locales -w
Options:
--help  | -h       Show this help
--watch | -w       Watch for file changes`)
    return
  } else if (options.pathLocales === false) {
    return console.error('- no <localepath> folder specified. See --help.')
  } else {
    convertTranslationsFromXMLToJSON(options.pathLocales, options.watch)
  }
}

main()
