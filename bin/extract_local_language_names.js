const { readdirSync, readFileSync, writeFileSync } = require('fs')
const { join } = require('path')

const localeDir = join(__dirname, '..', '_locales')

// English Lang as fallback
const englishLang = JSON.parse(readFileSync(join(localeDir, 'en.json')))

function getAvailableLanguages () {
  return readdirSync(localeDir)
    .filter(l => {
      return !l.startsWith('_') && l.endsWith('.json')
    })
    .map(l => {
      const locale = l.split('.json')[0]
      const content = JSON.parse(readFileSync(join(localeDir, l)))
      const localLangName = content[`language_${locale}`] || englishLang[`language_${locale}`]
      return {
        locale,
        name: localLangName.message
      }
    })
}

writeFileSync(join(localeDir, '_languages.json'), JSON.stringify(getAvailableLanguages(), null, 2))
