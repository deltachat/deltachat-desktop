import { app as rawApp, clipboard } from 'electron'
import { ExtendedAppMainProcess } from '../types'
import { getLogger } from '../../shared/logger'
import SplitOut from './splitout'
import { LocaleData } from '../../shared/localize'
import setLanguage, { loadTranslations } from '../load-translations'
import { loadTheme, getAvailableThemes, resolveThemeAddress } from '../themes'
import { txCoreStrings } from './login'
const app = rawApp as ExtendedAppMainProcess
const log = getLogger('main/deltachat/extras')
import { refresh as refreshMenu } from '../menu'
import { join } from 'path'
import mimeTypes from 'mime-types'
import { writeFile } from 'fs/promises'

// Extras, mainly Electron functions
export default class Extras extends SplitOut {
  getLocaleData(locale: string): LocaleData {
    if (locale) {
      loadTranslations(locale)
    }
    return app.localeData
  }
  setLocale(locale: string) {
    setLanguage(locale)
    this._controller.login.setCoreStrings(txCoreStrings())
    refreshMenu()
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

  async writeClipboardToTempFile() {
    const formats = clipboard.availableFormats().sort()
    log.debug('Clipboard available formats:', formats)
    if (formats.length <= 0) {
      throw new Error('No files to write')
    }
    const pathToFile = join(
      rawApp.getPath('temp'),
      `paste.${mimeTypes.extension(formats[0]) || 'bin'}`
    )
    const buf = clipboard.readBuffer(formats[0])
    log.debug(`Writing clipboard ${formats[0]} to file ${pathToFile}`)
    await writeFile(pathToFile, buf, 'binary')
    return pathToFile
  }
}
