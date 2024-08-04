// This needs to be injected / imported before the frontend script

import {
  DcNotification,
  DcOpenWebxdcParameters,
  DesktopSettingsType,
  RC_Config,
  RuntimeInfo,
  RuntimeOpenDialogOptions,
  Theme,
} from '@deltachat-desktop/shared/shared-types.js'
import '@deltachat-desktop/shared/global.d.ts'

import { Runtime } from '@deltachat-desktop/runtime-interface'
import { BaseDeltaChat, yerpc } from '@deltachat/jsonrpc-client'

import type { dialog, app } from 'electron'
import type { LocaleData } from '@deltachat-desktop/shared/localize.js'
import type { getLogger as getLoggerFunction } from '@deltachat-desktop/shared/logger.js'
import type { setLogHandler as setLogHandlerFunction } from '@deltachat-desktop/shared/logger.js'


const { app_getPath, ipcRenderer: ipcBackend } = (window as any)
  .electron_functions as {
  // see static/preload.js
  ipcRenderer: import('electron').IpcRenderer
  app_getPath: typeof app.getPath
}

const { BaseTransport } = yerpc

class ElectronTransport extends BaseTransport {
  constructor(
    private hasDebugEnabled: boolean,
    private callCounterFunction: (label: string) => void
  ) {
    super()
    ipcBackend.on('json-rpc-message', (_ev: any, response: any) => {
      const message: yerpc.Message = JSON.parse(response)
      if (hasDebugEnabled) {
        /* ignore-console-log */
        console.debug('%c▼ %c[JSONRPC]', 'color: red', 'color:grey', message)
      }
      this._onmessage(message)
    })
  }
  _send(message: yerpc.Message): void {
    const serialized = JSON.stringify(message)
    ipcBackend.invoke('json-rpc-request', serialized)
    if (this.hasDebugEnabled) {
      /* ignore-console-log */
      console.debug('%c▲ %c[JSONRPC]', 'color: green', 'color:grey', message)
      if ((message as any)['method']) {
        this.callCounterFunction((message as any).method)
        this.callCounterFunction('total')
      }
    }
  }
}

class ElectronDeltachat extends BaseDeltaChat<ElectronTransport> {
  close() {
    /** noop */
  }
  constructor(
    hasDebugEnabled: boolean,
    callCounterFunction: (label: string) => void
  ) {
    super(new ElectronTransport(hasDebugEnabled, callCounterFunction), true)
  }
}

class ElectronRuntime implements Runtime {
  onResumeFromSleep: (() => void) | undefined
  onWebxdcSendToChat:
    | ((
        file: { file_name: string; file_content: string } | null,
        text: string | null
      ) => void)
    | undefined
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
  createDeltaChatConnection(
    hasDebugEnabled: boolean,
    callCounterFunction: (label: string) => void
  ): BaseDeltaChat<any> {
    return new ElectronDeltachat(hasDebugEnabled, callCounterFunction)
  }
  openMessageHTML(
    window_id: string,
    accountId: number,
    isContactRequest: boolean,
    subject: string,
    sender: string,
    receiveTime: string,
    content: string
  ): void {
    ipcBackend.invoke(
      'openMessageHTML',
      window_id,
      accountId,
      isContactRequest,
      subject,
      sender,
      receiveTime,
      content
    )
  }
  notifyWebxdcStatusUpdate(accountId: number, instanceId: number): void {
    ipcBackend.invoke('webxdc:status-update', accountId, instanceId)
  }

  notifyWebxdcRealtimeData(
    accountId: number,
    instanceId: number,
    payload: number[]
  ): void {
    ipcBackend.invoke('webxdc:realtime-data', accountId, instanceId, payload)
  }

  notifyWebxdcMessageChanged(accountId: number, instanceId: number): void {
    ipcBackend.invoke('webxdc:message-changed', accountId, instanceId)
  }
  notifyWebxdcInstanceDeleted(accountId: number, instanceId: number): void {
    ipcBackend.invoke('webxdc:instance-deleted', accountId, instanceId)
  }
  openMapsWebxdc(accountId: number, chatId?: number | undefined): void {
    ipcBackend.invoke('open-maps-webxdc', accountId, chatId)
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
  getWebxdcDiskUsage(accountId: number): Promise<{
    total_size: number
    data_size: number
  }> {
    return ipcBackend.invoke('webxdc.getWebxdcDiskUsage', accountId)
  }
  async writeClipboardToTempFile(): Promise<string> {
    return ipcBackend.invoke('app.writeClipboardToTempFile')
  }
  writeTempFileFromBase64(name: string, content: string): Promise<string> {
    return ipcBackend.invoke('app.writeTempFileFromBase64', name, content)
  }
  writeTempFile(name: string, content: string): Promise<string> {
    return ipcBackend.invoke('app.writeTempFile', name, content)
  }
  removeTempFile(path: string): Promise<void> {
    return ipcBackend.invoke('app.removeTempFile', path)
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
    return ipcBackend.invoke('electron.shell.openPath', path)
  }
  getAppPath(name: Parameters<Runtime['getAppPath']>[0]): string {
    return app_getPath(name)
  }
  async downloadFile(pathToSource: string, filename: string): Promise<void> {
    await ipcBackend.invoke('saveFile', pathToSource, filename)
  }
  readClipboardText(): Promise<string> {
    return ipcBackend.invoke('electron.clipboard.readText')
  }
  readClipboardImage(): Promise<string | null> {
    return ipcBackend.invoke('electron.clipboard.readImage')
  }
  writeClipboardText(text: string): Promise<void> {
    return ipcBackend.invoke('electron.clipboard.writeText', text)
  }
  writeClipboardImage(path: string): Promise<void> {
    return ipcBackend.invoke('electron.clipboard.writeImage', path)
  }
  transformBlobURL(blob: string): string {
    if (!blob) {
      return blob
    }
    const path_components = blob.replace(/\\/g, '/').split('/')
    const filename2 = path_components[path_components.length - 1]

    if (decodeURIComponent(filename2) === filename2) {
      // if it is not already encoded then encode it.
      return blob.replace(filename2, encodeURIComponent(filename2))
    } else {
      return blob
    }
  }
  async showOpenFileDialog(options: RuntimeOpenDialogOptions): Promise<string> {
    const { filePaths } = await (<ReturnType<typeof dialog.showOpenDialog>>(
      ipcBackend.invoke('fileChooser', options as Electron.OpenDialogOptions)
    ))
    return filePaths && filePaths[0]
  }
  openLink(link: string): void {
    if (link.startsWith('http:') || link.startsWith('https:')) {
      ipcBackend.invoke('electron.shell.openExternal', link)
    } else {
      this.log.error('tried to open a non http/https external link', {
        link,
      })
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

  private log!: ReturnType<typeof getLoggerFunction>
  // we need to get them from outside,
  // because its a different bundle otherwise we would create a disconnected instance of the logging system 
  initialize(setLogHandler: typeof setLogHandlerFunction, getLogger: typeof getLoggerFunction) {
    this.log = getLogger('runtime/electron')

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
    ipcBackend.on('showHelpDialog', this.openHelpWindow.bind(null, undefined))
    ipcBackend.on('ClickOnNotification', (_ev, data) =>
      this.notificationCallback(data)
    )
    ipcBackend.on('chooseLanguage', (_ev, locale) => {
      this.onChooseLanguage?.(locale)
    })
    ipcBackend.on('theme-update', () => this.onThemeUpdate?.())
    ipcBackend.on('showAboutDialog', () => this.onShowDialog?.('about'))
    ipcBackend.on(
      'showKeybindingsDialog',
      () => this.onShowDialog?.('keybindings')
    )
    ipcBackend.on('showSettingsDialog', () => this.onShowDialog?.('settings'))
    ipcBackend.on('open-url', (_ev, url) => this.onOpenQrUrl?.(url))
    ipcBackend.on(
      'webxdc.sendToChat',
      (
        _ev,
        file: { file_name: string; file_content: string } | null,
        text: string | null
      ) => this.onWebxdcSendToChat?.(file, text)
    )
    ipcBackend.on('onResumeFromSleep', () => this.onResumeFromSleep?.())
  }
  openHelpWindow(anchor?: string): void {
    ipcBackend.send('help', window.localeData.locale, anchor)
  }
  openLogFile(): void {
    ipcBackend.invoke('electron.shell.openPath', this.getCurrentLogLocation())
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

;(window as any).r = new ElectronRuntime()
