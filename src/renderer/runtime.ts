import { ipcBackend } from './ipc'
import { RC_Config, ExtendedApp } from '../shared/shared-types'
import { setLogHandler } from '../shared/logger'

const { remote, openExternal, openItem } = window.electron_functions

/**
 * Offers an abstaction Layer to make it easier to make browser client in the future
 */
interface Runtime {
  /**
   * initializes runtime stuff
   * - sets the LogHandler
   * - event listeners on runtime events
   */
  initialize(): void
  reloadWebContent(): void
  openLogFile(): void
  getCurrentLogLocation(): string
  openHelpWindow(): void
  updateBadge(): void
  /**
   * get the comandline arguments
   */
  getRC_Config(): RC_Config
  /**
   * Opens a link in a new Window or in the Browser
   * @param link
   */
  openLink(link: string): void
}

class Browser implements Runtime {
  openLink(link: string): void {
    throw new Error('Method not implemented.')
  }
  initialize(): void {
    throw new Error('Method not implemented.')
  }
  getRC_Config(): RC_Config {
    throw new Error('Method not implemented.')
  }
  updateBadge(): void {
    throw new Error('Method not implemented.')
  }
  openHelpWindow(): void {
    throw new Error('Method not implemented.')
  }
  openLogFile(): void {
    throw new Error('Method not implemented.')
  }
  getCurrentLogLocation(): string {
    return 'not implemented.'
  }
  reloadWebContent(): void {
    window.location.reload()
  }
}

class Electron implements Runtime {
  openLink(link: string): void {
    openExternal(link)
  }
  getRC_Config(): RC_Config {
    return (remote.app as ExtendedApp).rc
  }
  initialize() {
    setLogHandler(
      (...args: any[]) => ipcBackend.send('handleLogMessage', ...args),
      this.getRC_Config()
    )
    ipcBackend.on('showHelpDialog', this.openHelpWindow)
  }
  openHelpWindow(): void {
    ipcBackend.send('help', window.localeData.locale)
  }
  openLogFile(): void {
    openItem(this.getCurrentLogLocation())
  }
  getCurrentLogLocation(): string {
    return ipcBackend.sendSync('get-log-path')
  }
  reloadWebContent(): void {
    ipcBackend.send('reload-main-window')
  }
  updateBadge() {
    ipcBackend.send('update-badge')
  }
}

export const runtime: Runtime = true /* is electron */
  ? new Electron()
  : new Browser()
;(window as any).r = runtime
