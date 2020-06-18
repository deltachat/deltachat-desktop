import { app as rawApp } from 'electron'
import { ExtendedAppMainProcess } from '../types'
import { getLogger } from '../../shared/logger'
import SplitOut from './splitout'
import { LocaleData } from '../../shared/localize'
import loadTranslations from '../load-translations'
import { loadTheme, getAvailableThemes, resolveThemeAddress } from '../themes'
const app = rawApp as ExtendedAppMainProcess
const log = getLogger('main/deltachat/extras')

// Extras, mainly Electron functions
export default class Extras extends SplitOut {
  getLocaleData(locale: string): LocaleData {
    if (locale) {
      loadTranslations(locale)
    }
    return app.localeData
  }
  async getActiveTheme() {
    try {
      log.debug('theme', app.state.saved.activeTheme)
      return await loadTheme(app.state.saved.activeTheme)
    } catch (error) {
      log.error('loading theme failed:', error)
      return null
    }
  }
  async setTheme(address: string) {
    try {
      resolveThemeAddress(address)
      app.state.saved.activeTheme = address
      app.saveState()
      return true
    } catch (error) {
      log.error('set theme failed: ', error)
      return false
    }
  }
  
  async getAvailableThemes() {
    return await getAvailableThemes()
  }
}
