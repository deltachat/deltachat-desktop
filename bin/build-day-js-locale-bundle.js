//@ts-check
// bundles all dayjs locales of languages we support
const locales = require('../_locales/_languages.json')
const { join } = require('path')
const { readdir, readFile, writeFile } = require('fs/promises')
const { ensureDirSync, emptyDirSync, rmdir, emptyDir } = require('fs-extra')
const esbuild = require('esbuild')

const dayjs_source_folder = join(__dirname, '../node_modules/dayjs/esm/locale/')
const destination_folder = join(__dirname, '../html-dist/dayjs-locales')
ensureDirSync(destination_folder)
emptyDirSync(destination_folder)

function removeDayJsImport(source) {
  return source
    .replace(`import dayjs from '../index';`, '')
    .replace(`dayjs.locale(locale, null, true);`, '')
}

;(async () => {
  let indexFile = ''
  const dayjsLocaleFiles = await readdir(dayjs_source_folder)
  const neededLocales = Object.keys(locales)

  for (const locale of neededLocales) {
    const locale_for_search = locale.toLowerCase().replace(/_/g, '-')
    // search for exact match
    let dayjsLocale = dayjsLocaleFiles.find(l => l == `${locale_for_search}.js`)
    if (!dayjsLocale && locale_for_search.includes('-')) {
      // search for base language, when variant is not found
      console.debug(
        `locale ${locale} not found, trying to find ${
          locale_for_search.split('-')[0]
        } instead`
      )
      dayjsLocale = dayjsLocaleFiles.find(l =>
        l.startsWith(locale_for_search.split('-')[0])
      )
    }
    if (dayjsLocale) {
      const file = await readFile(
        join(dayjs_source_folder, dayjsLocale),
        'utf8'
      )
      await writeFile(
        join(destination_folder, locale + '.mjs'),
        removeDayJsImport(file),
        'utf-8'
      )
      indexFile += `export * as ${locale} from './${locale + '.mjs'}'\n`
    } else {
      console.error('warning no dayjs locale found for:', locale)
    }
  }

  await writeFile(join(destination_folder, 'index.mjs'), indexFile, 'utf8')

  await esbuild.build({
    bundle: true,
    outfile: join(__dirname, '../static/dayjs_locale.bundle.js'),
    stdin: { contents: indexFile, resolveDir: destination_folder },
    minify: true,
    format: 'esm',
  })

  await emptyDir(destination_folder)
  await rmdir(destination_folder)
})()
