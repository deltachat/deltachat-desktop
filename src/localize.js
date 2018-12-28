module.exports = {
  setup,
  translate,
  getLocaleMessages
}

const merge = require('lodash.merge')
const path = require('path')
const fs = require('fs')


const log = require('./main/log')

function translate (messages) {
  function getMessage (key, substitutions, opts) {
    if(typeof opts === 'string') opts = {quantity: opts}
    if(!opts) opts = {}

    const entry = messages[key]

    if (!entry) {
      console.error(
        ` 	🌐translation: Attempted to get translation for nonexistent key '${key}'`
      )
      return key
    }

    let message = entry.message
    if(opts.quantity) {
      if(typeof entry[opts.quantity] !== 'undefined') {
        message = entry[opts.quantity]
      } else {
        console.error(
          ` 	🌐translation: Missing quantity  '${opts.quantity}' for key '${key}'`
        )
      }
    }

    if(substitutions) {
      if (!Array.isArray(substitutions)) {
        substitutions = [substitutions]
      }

      let c = 0
      return message.replace(/(?:%\d\$[\w\d])|(?:%[\w\d])/g, () => {
        if (typeof substitutions[c] === 'undefined') {
          console.error(
            ` 	🌐translation: Missing ${c}th argument for key '${key}'`
          )
        }
        return substitutions[c++].toString()
      })
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

  try {
    return JSON.parse(fs.readFileSync(targetFile, 'utf-8'))
  } catch(err) {
    throw new Error(`JSON parse error in language file '${targetFile}'`, err)
  }
}

function setup (app, name) {
  let locale = normalizeLocaleName(name)
  // default to english when string not found
  const experimental = getLocaleMessages('_experimental_en')
  const english = getLocaleMessages('en')
  let messages

  try {
    messages = getLocaleMessages(locale)
    messages = merge(english, messages)
    messages = merge(messages, experimental)
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
