const merge = require('lodash.merge')
const fs = require('fs')

const log = require('./logger').getLogger('localize')

function translate (messages) {
  function getMessage (key, substitutions, opts) {
    if (typeof opts === 'string') opts = { quantity: opts }
    if (!opts) opts = {}

    const entry = messages[key]

    if (!entry) {
      log.error(`Missing translation for key '${key}'`)
      return key
    }

    let message = entry.message
    if (opts.quantity) {
      if (typeof entry[opts.quantity] !== 'undefined') {
        message = entry[opts.quantity]
      } else {
        log.error(`Missing quantity '${opts.quantity}' for key '${key}'`)
      }
    }

    if (substitutions) {
      if (!Array.isArray(substitutions)) {
        substitutions = [substitutions]
      }

      let c = 0
      return message.replace(/(?:%\d\$[\w\d])|(?:%[\w\d])/g, () => {
        if (typeof substitutions[c] === 'undefined') {
          log.error(`Missing ${c} argument for key %c'${key}'`)
        }
        return substitutions[c++].toString()
      })
    }

    return message
  }

  return getMessage
}

function setup (app, locale) {
  const english = getLocaleMessages(localeFile('en'))

  let messages
  let file = localeFile(locale)

  if (!fs.existsSync(file)) {
    locale = locale.split('-')[0]
    file = localeFile(locale)
  }

  if (fs.existsSync(file)) {
    try {
      messages = getLocaleMessages(file)
      messages = merge(english, messages)
    } catch (e) {
      log.error(`Could not load messages for ${locale}`)
      locale = 'en'
      messages = english
    }
  } else {
    locale = 'en'
    messages = english
  }

  const localeData = { messages, locale }
  app.localeData = localeData
  app.translate = translate(app.localeData.messages)
  return localeData
}

function localeFile (locale) {
  const onDiskLocale = locale.replace('-', '_')
  return onDiskLocale
}

function getLocaleMessages (file) {
  try {
    return require('../_locales/' + file + '.json')
  } catch (err) {
    console.log(process.cwd())
    console.log(__dirname, file)
    console.log(err)
    throw new Error(`JSON parse error in language file '${file}'`)
  }
}

module.exports = { setup, translate }
