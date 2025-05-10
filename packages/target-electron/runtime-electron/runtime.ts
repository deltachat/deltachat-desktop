// This needs to be injected / imported before the frontend script

import {
  AutostartState,
  DcNotification,
  DcOpenWebxdcParameters,
  DesktopSettingsType,
  RC_Config,
  RuntimeInfo,
  RuntimeOpenDialogOptions,
  Theme,
} from '@deltachat-desktop/shared/shared-types.js'
import '@deltachat-desktop/shared/global.d.ts'

import {
  MediaAccessStatus,
  MediaType,
  Runtime,
} from '@deltachat-desktop/runtime-interface'
import { BaseDeltaChat, yerpc } from '@deltachat/jsonrpc-client'

import type { dialog, app, IpcRenderer, webUtils } from 'electron'
import type { LocaleData } from '@deltachat-desktop/shared/localize.js'
import type { getLogger as getLoggerFunction } from '@deltachat-desktop/shared/logger.js'
import type { setLogHandler as setLogHandlerFunction } from '@deltachat-desktop/shared/logger.js'

const {
  app_getPath,
  ipcRenderer: ipcBackend,
  getPathForFile,
} = (window as any).get_electron_functions() as {
  // see static/preload.js
  ipcRenderer: IpcRenderer
  app_getPath: typeof app.getPath
  getPathForFile: typeof webUtils.getPathForFile
}

const { BaseTransport } = yerpc

let logJsonrpcConnection = false

const idToRequestMap = new Map<
  yerpc.Message['id'],
  { message: yerpc.Message; sentAt: number }
>()

class ElectronTransport extends BaseTransport {
  constructor(private callCounterFunction: (label: string) => void) {
    super()
    ipcBackend.on('json-rpc-message', (_ev: any, response: any) => {
      const message: yerpc.Message = JSON.parse(response)
      if (logJsonrpcConnection) {
        const responseAt = performance.now()
        const request = idToRequestMap.get(message.id)
        idToRequestMap.delete(message.id)

        const duration =
          request != undefined
            ? (responseAt - request.sentAt).toFixed(3)
            : undefined

        let requestToLog = undefined
        const responseToLog = { ...message }
        delete responseToLog.jsonrpc
        if (request != undefined) {
          delete responseToLog.id

          requestToLog = { ...request.message }
          delete requestToLog.jsonrpc
          // Let's keep the ID so that the respective console log
          // for the "request sent" can be found.
          // delete requestToLog.id
        }

        /* ignore-console-log */
        console.debug(
          '%c▼ %c[JSONRPC]',
          'color: red',
          'color:grey',
          `${duration} ms`,
          requestToLog,
          '->\n',
          (responseToLog as yerpc.Response)?.result ??
            (responseToLog as yerpc.Response)?.error ??
            responseToLog
        )
      }
      this._onmessage(message)
    })
  }
  _send(message: yerpc.Message): void {
    const serialized = JSON.stringify(message)
    ipcBackend.invoke('json-rpc-request', serialized)
    if (logJsonrpcConnection) {
      const sentAt = performance.now()
      idToRequestMap.set(message.id, { message, sentAt })
      // Just in case we don't receive the response within 60 seconds,
      // to avoid a memory leak.
      setTimeout(() => {
        idToRequestMap.delete(message.id)
      }, 60000)

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
  constructor(callCounterFunction: (label: string) => void) {
    super(new ElectronTransport(callCounterFunction), true)
  }
}

class ElectronRuntime implements Runtime {
  onResumeFromSleep: (() => void) | undefined
  onWebxdcSendToChat:
    | ((
        file: { file_name: string; file_content: string } | null,
        text: string | null,
        account?: number
      ) => void)
    | undefined
  onOpenQrUrl: ((url: string) => void) | undefined
  onShowDialog:
    | ((kind: 'about' | 'keybindings' | 'settings') => void)
    | undefined
  onDragFileOut(file: string): void {
    ipcBackend.send('ondragstart', file)
  }
  isDroppedFileFromOutside(file: File): boolean {
    const path = getPathForFile(file)
    const forbiddenPathRegEx = /DeltaChat\/.+?\.sqlite-blobs\//gi
    return !forbiddenPathRegEx.test(path.replace('\\', '/'))
  }
  onThemeUpdate: (() => void) | undefined
  onChooseLanguage: ((locale: string) => Promise<void>) | undefined
  onToggleNotifications: (() => void) | undefined
  emitUIFullyReady(): void {
    ipcBackend.send('frontendReady')
  }
  emitUIReady(): void {
    ipcBackend.send('ipcReady')
  }
  createDeltaChatConnection(
    callCounterFunction: (label: string) => void
  ): BaseDeltaChat<any> {
    return new ElectronDeltachat(callCounterFunction)
  }
  openMessageHTML(
    accountId: number,
    messageId: number,
    isContactRequest: boolean,
    subject: string,
    sender: string,
    receiveTime: string,
    content: string
  ): void {
    ipcBackend.invoke(
      'openMessageHTML',
      accountId,
      messageId,
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
  async clearWebxdcDOMStorage(accountId: number): Promise<void> {
    ipcBackend.invoke('webxdc.clearWebxdcDOMStorage', accountId)
  }
  getWebxdcDiskUsage(accountId: number): Promise<{
    total_size: number
    data_size: number
  }> {
    return ipcBackend.invoke('webxdc.getWebxdcDiskUsage', accountId)
  }
  async writeClipboardToTempFile(_name: string | undefined): Promise<string> {
    return ipcBackend.invoke('app.writeClipboardToTempFile')
  }
  writeTempFileFromBase64(name: string, content: string): Promise<string> {
    return ipcBackend.invoke('app.writeTempFileFromBase64', name, content)
  }
  writeTempFile(name: string, content: string): Promise<string> {
    return ipcBackend.invoke('app.writeTempFile', name, content)
  }
  copyFileToInternalTmpDir(
    fileName: string,
    sourcePath: string
  ): Promise<string> {
    return ipcBackend.invoke(
      'app.copyFileToInternalTmpDir',
      fileName,
      sourcePath
    )
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
  clearNotifications(accountId: number, chatId: number): void {
    ipcBackend.invoke('notifications.clear', accountId, chatId)
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
  async getAppPath(
    name: Parameters<Runtime['getAppPath']>[0]
  ): Promise<string> {
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
  transformStickerURL(sticker_path: string): string {
    /**
     * Some entities that are valid path parts but would be decoded by the browser (like %, #, ? ) etc.
     * so we need to be encode them before passing the path to the browser:
     * a path like "folder%20name/file" would be decoded to "folder name/file"
     *
     * Since Window paths have backslashes these will be encoded to %5C but since the browser on windows
     * does not decode them back we have to decode those before passing the path to the browser
     */
    const a = encodeURI(`file://${sticker_path}`)
    return a
      .replace(/[?#]/g, encodeURIComponent) // special case # and ? are not encoded by encodeURI but "ignored" in URLs
      .replace(/%5C/g, decodeURIComponent) // restore encoded backslashes (for Windows)
  }

  async showOpenFileDialog(
    options: RuntimeOpenDialogOptions
  ): Promise<string[]> {
    const { filePaths } = await (<ReturnType<typeof dialog.showOpenDialog>>(
      ipcBackend.invoke('fileChooser', options as Electron.OpenDialogOptions)
    ))
    return filePaths
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
  initialize(
    setLogHandler: typeof setLogHandlerFunction,
    getLogger: typeof getLoggerFunction
  ): Promise<void> {
    this.log = getLogger('runtime/electron')

    // fetch vars
    const config = (this.rc_config = ipcBackend.sendSync('get-rc-config'))
    this.runtime_info = ipcBackend.sendSync('get-runtime-info')

    if (config['log-debug']) {
      logJsonrpcConnection = true
    }

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
        text: string | null,
        account?: number
      ) => this.onWebxdcSendToChat?.(file, text, account)
    )
    ipcBackend.on('onResumeFromSleep', () => this.onResumeFromSleep?.())

    return Promise.resolve()
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
  getAutostartState(): Promise<AutostartState> {
    // TODO - see https://github.com/deltachat/deltachat-desktop/issues/2518
    return Promise.resolve({
      isSupported: false,
      isRegistered: false,
    })
  }
  checkMediaAccess(mediaType: MediaType): Promise<MediaAccessStatus> {
    return ipcBackend.invoke('checkMediaAccess', mediaType)
  }
  // undefined is returned if the platform does not support askForMediaAccess
  askForMediaAccess(mediaType: MediaType): Promise<boolean | undefined> {
    return ipcBackend.invoke('askForMediaAccess', mediaType)
  }
}

;(window as any).r = new ElectronRuntime()
