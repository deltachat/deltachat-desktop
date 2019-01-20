const merge = require('lodash.merge')
const path = require('path')
const fs = require('fs')

const log = require('./logger').getLogger('translations')

function translate (messages) {
  function getMessage (key, substitutions, opts) {
    if (typeof opts === 'string') opts = { quantity: opts }
    if (!opts) opts = {}

    const entry = messages[key]

    if (!entry) {
      log.error(`Missing translation for key '${key}'`, key, 'translations_missing_key')
      return key
    }

    let message = entry.message
    if (opts.quantity) {
      if (typeof entry[opts.quantity] !== 'undefined') {
        message = entry[opts.quantity]
      } else {
        log.error(
          `Missing quantity '${opts.quantity}' for key '${key}'`, { quantity: opts.quantity }, 'translations_missing_quantity'
        )
      }
    }

    if (substitutions) {
      if (!Array.isArray(substitutions)) {
        substitutions = [substitutions]
      }

      let c = 0
      return message.replace(/(?:%\d\$[\w\d])|(?:%[\w\d])/g, () => {
        if (typeof substitutions[c] === 'undefined') {
          log.error(`Missing ${c} argument for key %c'${key}'`, { index: c, key }, 'translations_missing_argument')
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
<<<<<<< HEAD
    file = localeFile(locale)
=======
    localeFile = retrieveLocaleFile(locale)
    localeMessages = getLocaleMessages(localeFile)
  } else if (!localeMessages) {
    log.error(`Could not load messages for ${locale}`)
    locale = 'en'
    messages = messagesEnglish
>>>>>>> Implement instruction text to login form. We use experimental language strings, yeyy
  }

  if (localeMessages) {
    messages = merge(messagesEnglish, localeMessages)
  }

  let experimentalFile = retrieveLocaleFile('_experimental_en')
  let experimentalMessages = getLocaleMessages(experimentalFile)
  if (experimentalMessages) {
    messages = merge(messages, experimentalMessages)
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
  return path.join(__dirname, '..', '_locales', onDiskLocale + '.json')
}

function getLocaleMessages (file) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf-8'))
  } catch (err) {
    throw new Error(`JSON parse error in language file '${file}'`)
  }
}

module.exports = { setup, translate }
