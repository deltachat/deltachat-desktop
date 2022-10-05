import SplitOut from './splitout'
import { LocaleData } from '../../shared/localize'
import setLanguage, {
  getCurrentLocaleDate,
  loadTranslations,
} from '../load-translations'
import { txCoreStrings } from './login'
import { refresh as refreshMenu } from '../menu'

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
}
