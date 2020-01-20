const merge = require('lodash.merge')
const path = require('path')
const fs = require('fs')

const log = require('./shared/logger').getLogger('localize')

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
    if (typeof opts.quantity !== 'undefined') {
      if (typeof opts.quantity === 'string') {
        message = entry[opts.quantity]
      } else if (typeof opts.quantity === 'number') {
        message = entry[opts.quantity] || opts.quantity === 1 ? entry['one'] : entry['other']
      } else {
        message = undefined
      }
      if (typeof message === 'undefined') {
        log.error(`Missing quantity '${opts.quantity}' for key '${key}'`)
        return `${key}:${opts.quantity}`
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
          return ''
        }
        return substitutions[c++].toString()
      })
    }

    return message
  }

  return getMessage
}

function setup (app, locale) {
  const messagesEnglish = getLocaleMessages(retrieveLocaleFile('en'))

  let messages

  let localeFile = retrieveLocaleFile(locale)
  let localeMessages = getLocaleMessages(localeFile)

  if (!localeMessages && locale.indexOf('-') !== -1) {
    // We couldn't load the file for the locale but it's a dialect. Try to fall
    // back to the main language (example: de-CH -> de)
    locale = locale.split('-')[0]
    localeFile = retrieveLocaleFile(locale)
    localeMessages = getLocaleMessages(localeFile)
  } else if (!localeMessages) {
    log.error(`Could not load messages for ${locale}`, locale)
    locale = 'en'
    messages = messagesEnglish
  }

  if (localeMessages) {
    messages = merge(messagesEnglish, localeMessages)
  }

  const experimentalFile = retrieveLocaleFile('_untranslated_en')
  const experimentalMessages = getLocaleMessages(experimentalFile)
  if (experimentalMessages) {
    messages = merge(messages, experimentalMessages)
  } else {
    log.debug(`No experimental language file (${experimentalFile}) found`)
  }

  log.debug(messages['no_chat_selected_suggestion_desktop'])
  const localeData = { messages, locale }
  app.localeData = localeData
  app.translate = translate(app.localeData.messages)
  return localeData
}

function retrieveLocaleFile (locale) {
  const onDiskLocale = locale.replace('-', '_')
  return path.join(__dirname, '..', '_locales', onDiskLocale + '.json')
}

function getLocaleMessages (file) {
  if (!fs.existsSync(file)) return false
  try {
    return JSON.parse(fs.readFileSync(file, 'utf-8'))
  } catch (err) {
    throw new Error(`JSON parse error in language file '${file}'`, err)
  }
}

module.exports = { setup, translate }
