import {
  DcNotification,
  DcOpenWebxdcParameters,
  DesktopSettingsType,
  RC_Config,
  RuntimeInfo,
  Theme,
} from '../shared/shared-types'
import { setLogHandler } from '../shared/logger'
import type {
  dialog,
  app,
  shell,
  clipboard,
  nativeImage as electronNativeImage,
} from 'electron'
import { getLogger } from '../shared/logger'
import processOpenQrUrl from './components/helpers/OpenQrUrl'
import { LocaleData } from '../shared/localize'

const log = getLogger('renderer/runtime')

const {
  openExternal,
  openPath,
  nativeImage,
  write_clipboard_text,
  read_clipboard_text,
  app_getPath,
  write_clipboard_image,
  ipcRenderer: ipcBackend,
} = (window as any).electron_functions as {
  // see static/preload.js
  ipcRenderer: import('electron').IpcRenderer
  openExternal: typeof shell.openExternal
  openPath: typeof shell.openPath
  nativeImage: typeof electronNativeImage
  app_getPath: typeof app.getPath
  write_clipboard_text: typeof clipboard.writeText
  read_clipboard_text: typeof clipboard.readText
  write_clipboard_image: typeof clipboard.writeImage
}

/**
 * Offers an abstraction Layer to make it easier to make browser client in the future
 */
interface Runtime {
  emitUIFullyReady(): void
  emitUIReady(): void
  openMessageHTML(content: string): void
  getDesktopSettings(): Promise<DesktopSettingsType>
  setDesktopSetting(
    key: keyof DesktopSettingsType,
    value: string | number | boolean | undefined
  ): Promise<void>
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
  /**
   * get the comandline arguments
   */
  getRC_Config(): RC_Config
  /**
   * get the additional info about the runtime
   */
  getRuntimeInfo(): RuntimeInfo
  /**
   * Opens a link in a new Window or in the Browser
   * @param link
   */
  openLink(link: string): void
  showOpenFileDialog(
    options: Electron.OpenDialogOptions
  ): Promise<string | null>
  downloadFile(pathToFile: string): Promise<void>
  transformBlobURL(blob: string): string
  readClipboardText(): Promise<string>
  writeClipboardText(text: string): Promise<void>
  writeClipboardImage(path: string): Promise<boolean>
  getAppPath(name: Parameters<typeof app.getPath>[0]): string
  openPath(path: string): Promise<string>
  getConfigPath(): string

  // webxdc
  openWebxdc(msgId: number, params: DcOpenWebxdcParameters): void
  getWebxdcIconURL(accountId: number, msgId: number): string
  deleteWebxdcAccountData(accountId: number): Promise<void>
  closeAllWebxdcInstances(): void
  notifyWebxdcStatusUpdate(accountId: number, instanceId: number): void
  notifyWebxdcInstanceDeleted(accountId: number, instanceId: number): void

  // control app
  restartApp(): void

  // translations
  getLocaleData(locale?: string): Promise<LocaleData>
  setLocale(locale: string): Promise<void>

  // more system integration functions:
  setBadgeCounter(value: number): void
  showNotification(data: DcNotification): void
  clearAllNotifications(): void
  clearNotifications(chatId: number): void
  setNotificationCallback(
    cb: (data: { accountId: number; chatId: number; msgId: number }) => void
  ): void
  writeClipboardToTempFile(): Promise<string>
  getWebxdcDiskUsage(
    accountId: number
  ): Promise<{
    total_size: number
    data_size: number
  }>
  clearWebxdcDOMStorage(accountId: number): Promise<void>
  getAvailableThemes(): Promise<Theme[]>
  getActiveTheme(): Promise<{
    theme: Theme
    data: string
  } | null>
  resolveThemeAddress(address: string): Promise<string>
  saveBackgroundImage(file: string, isDefaultPicture: boolean): Promise<string>
  onDragFileOut(file: string): void

  // callbacks to set
  onChooseLanguage: ((locale: string) => Promise<void>) | undefined
  onThemeUpdate: (() => void) | undefined
  onShowDialog:
    | ((kind: 'about' | 'keybindings' | 'settings') => void)
    | undefined
  onOpenQrUrl: ((url: string) => void) | undefined
}

class Browser implements Runtime {
  onOpenQrUrl: ((url: string) => void) | undefined
  onShowDialog:
    | ((kind: 'about' | 'keybindings' | 'settings') => void)
    | undefined
  emitUIFullyReady(): void {
    throw new Error('Method not implemented.')
  }
  onDragFileOut(_file: string): void {
    throw new Error('Method not implemented.')
  }
  onThemeUpdate: (() => void) | undefined
  onChooseLanguage: ((locale: string) => Promise<void>) | undefined
  emitUIReady(): void {
    throw new Error('Method not implemented.')
  }
  openMessageHTML(_content: string): void {
    throw new Error('Method not implemented.')
  }
  notifyWebxdcStatusUpdate(_accountId: number, _instanceId: number): void {
    throw new Error('Method not implemented.')
  }
  notifyWebxdcInstanceDeleted(_accountId: number, _instanceId: number): void {
    throw new Error('Method not implemented.')
  }
  saveBackgroundImage(
    _file: string,
    _isDefaultPicture: boolean
  ): Promise<string> {
    throw new Error('Method not implemented.')
  }
  getLocaleData(_locale?: string | undefined): Promise<LocaleData> {
    throw new Error('Method not implemented.')
  }
  setLocale(_locale: string): Promise<void> {
    throw new Error('Method not implemented.')
  }
  setDesktopSetting(
    _key: keyof DesktopSettingsType,
    _value: string | number | boolean | undefined
  ): Promise<void> {
    throw new Error('Method not implemented.')
  }
  getAvailableThemes(): Promise<Theme[]> {
    throw new Error('Method not implemented.')
  }
  async getActiveTheme(): Promise<{ theme: Theme; data: string } | null> {
    return null
  }
  resolveThemeAddress(_address: string): Promise<string> {
    throw new Error('Method not implemented.')
  }
  clearWebxdcDOMStorage(_accountId: number): Promise<void> {
    throw new Error('Method not implemented.')
  }
  getWebxdcDiskUsage(
    _accountId: number
  ): Promise<{
    total_size: number
    data_size: number
  }> {
    throw new Error('Method not implemented.')
  }
  async writeClipboardToTempFile(): Promise<string> {
    throw new Error('Method not implemented.')
  }
  setNotificationCallback(
    _cb: (data: { accountId: number; chatId: number; msgId: number }) => void
  ): void {
    throw new Error('Method not implemented.')
  }
  showNotification(_data: DcNotification): void {
    throw new Error('Method not implemented.')
  }
  clearAllNotifications(): void {
    throw new Error('Method not implemented.')
  }
  clearNotifications(_chatId: number): void {
    throw new Error('Method not implemented.')
  }
  setBadgeCounter(_value: number): void {
    log.warn('setBadgeCounter is not implemented for browser')
  }
  deleteWebxdcAccountData(_accountId: number): Promise<void> {
    throw new Error('Method not implemented.')
  }
  closeAllWebxdcInstances(): void {
    throw new Error('Method not implemented.')
  }
  restartApp(): void {
    throw new Error('Method not implemented.')
  }
  getRuntimeInfo(): RuntimeInfo {
    throw new Error('Method not implemented.')
  }
  getDesktopSettings(): Promise<DesktopSettingsType> {
    throw new Error('Method not implemented.')
  }
  getWebxdcIconURL(_accountId: number, _msgId: number): string {
    throw new Error('Method not implemented.')
  }
  openWebxdc(_msgId: number, _params: DcOpenWebxdcParameters): void {
    throw new Error('Method not implemented.')
  }
  openPath(_path: string): Promise<string> {
    throw new Error('Method not implemented.')
  }
  getAppPath(_name: string): string {
    throw new Error('Method not implemented.')
  }
  downloadFile(_pathToFile: string): Promise<void> {
    throw new Error('Method not implemented.')
  }
  async readClipboardText(): Promise<string> {
    // return await navigator.clipboard.readText
    throw new Error('Method not implemented.')
  }
  writeClipboardText(_text: string): Promise<void> {
    // navigator.clipboard.writeText(text)
    throw new Error('Method not implemented.')
  }
  writeClipboardImage(_path: string): Promise<boolean> {
    throw new Error('Method not implemented.')
  }
  transformBlobURL(_blob: string): string {
    throw new Error('Method not implemented.')
  }
  async showOpenFileDialog(
    _options: Electron.OpenDialogOptions
  ): Promise<string> {
    throw new Error('Method not implemented.')
  }
  openLink(_link: string): void {
    throw new Error('Method not implemented.')
  }
  initialize(): void {
    throw new Error('Method not implemented.')
  }
  getRC_Config(): RC_Config {
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
  getConfigPath(): string {
    throw new Error('Method not implemented.')
  }
}
class Electron implements Runtime {
  onOpenQrUrl: ((url: string) => void) | undefined
  onShowDialog:
    | ((kind: 'about' | 'keybindings' | 'settings') => void)
    | undefined
  onDragFileOut(file: string): void {
    ipcBackend.send('ondragstart', file)
  }
  onThemeUpdate: (() => void) | undefined
  onChooseLanguage: ((locale: string) => Promise<void>) | undefined
  emitUIFullyReady(): void {
    ipcBackend.send('frontendReady')
  }
  emitUIReady(): void {
    ipcBackend.send('ipcReady')
  }
  openMessageHTML(content: string): void {
    ipcBackend.invoke('openMessageHTML', content)
  }
  notifyWebxdcStatusUpdate(accountId: number, instanceId: number): void {
    ipcBackend.invoke('webxdc:status-update', accountId, instanceId)
  }
  notifyWebxdcInstanceDeleted(accountId: number, instanceId: number): void {
    ipcBackend.invoke('webxdc:instance-deleted', accountId, instanceId)
  }
  saveBackgroundImage(
    file: string,
    isDefaultPicture: boolean
  ): Promise<string> {
    return ipcBackend.invoke('saveBackgroundImage', file, isDefaultPicture)
  }
  getLocaleData(locale?: string | undefined): Promise<LocaleData> {
    return ipcBackend.invoke('getLocaleData', locale)
  }
  setLocale(locale: string): Promise<void> {
    return ipcBackend.invoke('setLocale', locale)
  }
  getAvailableThemes(): Promise<Theme[]> {
    return ipcBackend.invoke('themes.getAvailableThemes')
  }
  getActiveTheme(): Promise<{ theme: Theme; data: string } | null> {
    return ipcBackend.invoke('themes.getActiveTheme')
  }
  resolveThemeAddress(address: string): Promise<string> {
    return ipcBackend.invoke('themes.getAvailableThemes', address)
  }
  async clearWebxdcDOMStorage(accountId: number): Promise<void> {
    ipcBackend.invoke('webxdc.clearWebxdcDOMStorage', accountId)
  }
  getWebxdcDiskUsage(
    accountId: number
  ): Promise<{
    total_size: number
    data_size: number
  }> {
    return ipcBackend.invoke('webxdc.getWebxdcDiskUsage', accountId)
  }
  async writeClipboardToTempFile(): Promise<string> {
    return ipcBackend.invoke('app.writeClipboardToTempFile')
  }
  private notificationCallback: (data: {
    accountId: number
    chatId: number
    msgId: number
  }) => void = () => {}
  setNotificationCallback(
    cb: (data: { accountId: number; chatId: number; msgId: number }) => void
  ): void {
    this.notificationCallback = cb
  }
  showNotification(data: DcNotification): void {
    ipcBackend.invoke('notifications.show', data)
  }
  clearAllNotifications(): void {
    ipcBackend.invoke('notifications.clearAll')
  }
  clearNotifications(chatId: number): void {
    ipcBackend.invoke('notifications.clear', chatId)
  }
  setBadgeCounter(value: number): void {
    ipcBackend.invoke('app.setBadgeCountAndTrayIconIndicator', value)
  }
  deleteWebxdcAccountData(accountId: number): Promise<void> {
    return ipcBackend.invoke('delete_webxdc_account_data', accountId)
  }
  closeAllWebxdcInstances(): void {
    ipcBackend.invoke('close-all-webxdc')
  }
  restartApp(): void {
    ipcBackend.invoke('restart_app')
  }
  getDesktopSettings(): Promise<DesktopSettingsType> {
    return ipcBackend.invoke('get-desktop-settings')
  }
  setDesktopSetting(
    key: keyof DesktopSettingsType,
    value: string | number | boolean | undefined
  ): Promise<void> {
    return ipcBackend.invoke('set-desktop-setting', key, value)
  }
  getWebxdcIconURL(accountId: number, msgId: number): string {
    return `webxdc-icon:${accountId}.${msgId}`
  }
  openWebxdc(msgId: number, params: DcOpenWebxdcParameters): void {
    ipcBackend.invoke('open-webxdc', msgId, params)
  }
  openPath(path: string): Promise<string> {
    return openPath(path)
  }
  getAppPath(name: Parameters<Runtime['getAppPath']>[0]): string {
    return app_getPath(name)
  }
  async downloadFile(pathToFile: string): Promise<void> {
    await ipcBackend.invoke('saveFile', pathToFile)
  }
  readClipboardText(): Promise<string> {
    return Promise.resolve(read_clipboard_text())
  }
  writeClipboardText(text: string): Promise<void> {
    return Promise.resolve(write_clipboard_text(text))
  }
  writeClipboardImage(path: string): Promise<boolean> {
    return new Promise(function (resolve) {
      try {
        const natImage = nativeImage.createFromPath(path)
        write_clipboard_image(natImage)
        log.debug('Copied image to clipboard.')
        resolve(true)
      } catch (error) {
        log.error('Copying image to clipboard failed: ', error)
        resolve(false)
      }
    })
  }
  transformBlobURL(blob: string): string {
    if (!blob) {
      return blob
    }
    const path_components = blob.replace(/\\/g, '/').split('/')
    const filename2 = path_components[path_components.length - 1]
    return blob.replace(filename2, encodeURIComponent(filename2))
  }
  async showOpenFileDialog(
    options: Electron.OpenDialogOptions
  ): Promise<string> {
    const { filePaths } = await (<ReturnType<typeof dialog.showOpenDialog>>(
      ipcBackend.invoke('fileChooser', options)
    ))
    return filePaths && filePaths[0]
  }
  openLink(link: string): void {
    if (link.startsWith('mailto:')) {
      processOpenQrUrl(link)
    } else {
      openExternal(link)
    }
  }
  private rc_config: RC_Config | null = null
  getRC_Config(): RC_Config {
    if (this.rc_config === null) {
      throw new Error('this.rc_config is not set')
    }
    return this.rc_config
  }
  private runtime_info: RuntimeInfo | null = null
  getRuntimeInfo(): RuntimeInfo {
    if (this.runtime_info === null) {
      throw new Error('this.runtime_info is not set')
    }
    return this.runtime_info
  }
  initialize() {
    // fetch vars
    this.rc_config = ipcBackend.sendSync('get-rc-config')
    this.runtime_info = ipcBackend.sendSync('get-runtime-info')

    // set log handler
    setLogHandler((...args: any[]) => {
      ipcBackend.send(
        'handleLogMessage',
        ...args.map(arg => {
          // filter args to be make sure electron doesn't give an object clone error (Error: An object could not be cloned)
          if (typeof arg === 'object') {
            // make sure objects are clean of unsupported types
            return JSON.parse(JSON.stringify(arg))
          } else if (typeof arg === 'function') {
            return arg.toString()
          } else {
            return arg
          }
        })
      )
    }, this.getRC_Config())
    ipcBackend.on('showHelpDialog', this.openHelpWindow)
    ipcBackend.on('ClickOnNotification', (_ev, data) =>
      this.notificationCallback(data)
    )
    ipcBackend.on('chooseLanguage', (_ev, locale) => {
      this.onChooseLanguage?.(locale)
    })
    ipcBackend.on('theme-update', () => this.onThemeUpdate?.())
    ipcBackend.on('showAboutDialog', () => this.onShowDialog?.('about'))
    ipcBackend.on('showKeybindingsDialog', () =>
      this.onShowDialog?.('keybindings')
    )
    ipcBackend.on('showSettingsDialog', () => this.onShowDialog?.('settings'))
    ipcBackend.on('open-url', (_ev, url) => this.onOpenQrUrl?.(url))
  }
  openHelpWindow(): void {
    ipcBackend.send('help', window.localeData.locale)
  }
  openLogFile(): void {
    openPath(this.getCurrentLogLocation())
  }
  getCurrentLogLocation(): string {
    return ipcBackend.sendSync('get-log-path')
  }
  reloadWebContent(): void {
    ipcBackend.send('reload-main-window')
  }
  getConfigPath(): string {
    return ipcBackend.sendSync('get-config-path')
  }
}

const IS_ELECTRON = true

export const runtime: Runtime = IS_ELECTRON ? new Electron() : new Browser()
;(window as any).r = runtime
