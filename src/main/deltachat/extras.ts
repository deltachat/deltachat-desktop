import { app as rawApp } from 'electron'
import { ExtendedAppMainProcess } from '../types'
import logger from '../../shared/logger'
import SplitOut from './splitout'
import { LocaleData } from '../../shared/localize'
import loadTranslations from '../load-translations'
const app = rawApp as ExtendedAppMainProcess
const log = logger.getLogger('main/deltachat/extras')

// Extras, mainly Electron functions
export default class Extras extends SplitOut {
  getLocaleData(locale: string): LocaleData {
    // locale-data
    if (locale) {
      return loadTranslations(locale)
    }
  }
}
