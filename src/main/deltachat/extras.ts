import { getLogger } from '../../shared/logger'
import SplitOut from './splitout'
import { LocaleData } from '../../shared/localize'
import setLanguage, {
  getCurrentLocaleDate,
  loadTranslations,
} from '../load-translations'
import { loadTheme, getAvailableThemes, resolveThemeAddress } from '../themes'
import { txCoreStrings } from './login'
const log = getLogger('main/deltachat/extras')
import { refresh as refreshMenu } from '../menu'
import { DesktopSettings } from '../desktop_settings'

// Extras, mainly Electron functions
export default class Extras extends SplitOut {
  getLocaleData(locale: string): LocaleData {
    if (locale) {
      loadTranslations(locale)
    }
    return getCurrentLocaleDate()
  }
  setLocale(locale: string) {
    setLanguage(locale)
    this.controller.login._setCoreStrings(txCoreStrings())
    refreshMenu()
  }
  async getActiveTheme() {
    try {
      log.debug('theme', DesktopSettings.state.activeTheme)
      return await loadTheme(DesktopSettings.state.activeTheme)
    } catch (error) {
      log.error('loading theme failed:', error)
      return null
    }
  }
  async setTheme(address: string) {
    try {
      resolveThemeAddress(address)
      DesktopSettings.update({ activeTheme: address })
      DesktopSettings.update({})
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
