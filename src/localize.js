module.exports = {
  setup,
  translate
}

const merge = require('lodash.merge')
const path = require('path')

const log = require('./main/log')

function translate (messages) {
  function getMessage (key, substitutions) {
    const entry = messages[key]
    if (!entry) {
      console.error(
        `i18n: Attempted to get translation for nonexistent key '${key}'`
      )
      return key
    }

    const { message } = entry
    if (substitutions) {
      const val = substitutions.quantity ? entry[substitutions.quantity] : message
      return val.replace(/\$.+?\$/, substitutions)
    }

    return message
  }

  return getMessage
}

function normalizeLocaleName (locale) {
  if (/^en-/.test(locale)) {
    return 'en'
  }

  return locale
}

function getLocaleMessages (locale) {
  const onDiskLocale = locale.replace('-', '_')

  const targetFile = path.join(
    __dirname,
    '..',
    '_locales',
    onDiskLocale + '.json'
  )

  return (targetFile)
}

function setup (app, name) {
  let locale = normalizeLocaleName(name)
  // default to english when string not found
  const english = getLocaleMessages('en')
  let messages

  try {
    messages = getLocaleMessages(locale)
    messages = merge(english, messages)
  } catch (e) {
    log.error(`Could not load messages for ${locale} ${e.stack}`)
    locale = 'en'
    messages = english
  }

  var localeData = {
    messages,
    locale
  }

  app.localeData = localeData
  app.translate = translate(app.localeData.messages)

  return localeData
}

