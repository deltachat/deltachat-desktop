const merge = require('lodash.merge')
const path = require('path')
const fs = require('fs')

const log = require('../shared/logger').getLogger('load-transaltions')

import { translate } from '../shared/localize'

export default function setup (app:any, locale:string) {
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

function retrieveLocaleFile (locale:string) {
  const onDiskLocale = locale.replace('-', '_')
  return path.join(__dirname, '..', '..', '_locales', onDiskLocale + '.json')
}

function getLocaleMessages (file:string) {
  if (!fs.existsSync(file)) return false
  try {
    return JSON.parse(fs.readFileSync(file, 'utf-8'))
  } catch (err) {
    log.error(`JSON parse error in language file '${file}'`, err)
    throw err
  }
}
