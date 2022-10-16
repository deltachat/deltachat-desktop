import path from 'path'
import fs from 'fs'

import { getLogger } from '../shared/logger'
const log = getLogger('load-translations')

import {
  getMessageFunction,
  LocaleData,
  translate as getTranslateFunction,
} from '../shared/localize'

import { refresh as refreshMenu } from './menu'
import { ipcMain } from 'electron'

let currentlocaleData: LocaleData | null = null

export function getCurrentLocaleDate(): LocaleData {
  if (currentlocaleData === null) {
    log.error('tried to get locale data before init')
    throw new Error('no locale data is loaded yet')
  }
  return currentlocaleData
}

let translateFunction: getMessageFunction | null = null
export const tx: getMessageFunction = function (key, substitutions, raw_opts) {
  if (translateFunction === null) {
    log.error('tried to use translation function before init')
    return key
  }
  return translateFunction(key, substitutions, raw_opts)
}

export default function setLanguage(locale: string) {
  const localeData = loadTranslations(locale)
  currentlocaleData = localeData
  translateFunction = getTranslateFunction(localeData.messages)
}

export function loadTranslations(locale: string) {
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
    messages = Object.assign({}, messagesEnglish, localeMessages)
  }

  const experimentalFile = retrieveLocaleFile('_untranslated_en')
  const experimentalMessages = getLocaleMessages(experimentalFile)
  if (experimentalMessages) {
    messages = Object.assign(messages, experimentalMessages)
  } else {
    log.debug(`No experimental language file (${experimentalFile}) found`)
  }

  log.debug(messages['no_chat_selected_suggestion_desktop'])
  return { messages, locale }
}

function retrieveLocaleFile(locale: string) {
  const onDiskLocale = locale.replace('-', '_')
  return path.join(__dirname, '..', '..', '_locales', onDiskLocale + '.json')
}

function getLocaleMessages(file: string) {
  if (!fs.existsSync(file)) return false
  try {
    return JSON.parse(fs.readFileSync(file, 'utf-8'))
  } catch (err) {
    log.error(`JSON parse error in language file '${file}'`, err)
    throw err
  }
}

ipcMain.handle(
  'getLocaleData',
  (_ev, locale?: string): LocaleData => {
    if (locale) {
      loadTranslations(locale)
    }
    return getCurrentLocaleDate()
  }
)

ipcMain.handle('setLocale', (_ev, locale: string) => {
  setLanguage(locale)
  refreshMenu()
})
