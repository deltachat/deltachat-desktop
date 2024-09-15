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

import { LocaleData } from '@deltachat-desktop/shared/localize.js'
import { Runtime } from '@deltachat-desktop/runtime-interface'
import { BaseDeltaChat, yerpc } from '@deltachat/jsonrpc-client'

import type { getLogger as getLoggerFunction } from '@deltachat-desktop/shared/logger.js'
import type { setLogHandler as setLogHandlerFunction } from '@deltachat-desktop/shared/logger.js'

import { MessageToBackend } from '../src/runtime-ws-protocol.js'

const { WebsocketTransport } = yerpc

class BrowserTransport extends WebsocketTransport {
  constructor(
    private hasDebugEnabled: boolean,
    private callCounterFunction: (label: string) => void
  ) {
    super('wss://localhost:3000/ws/dc')
  }

  protected _onmessage(message: yerpc.Message): void {
    if (
      (message as any)['method'] === 'error_other_client_stole_dc_connection'
    ) {
      alert(
        'error other client stole dc connection.\nonly use deltachat web in one browser at a time.\nreload to steal connection back.'
      )
      throw new Error(
        'connection inactive: error other client stole dc connection, please reload page'
      )
    }
    if (this.hasDebugEnabled) {
      /* ignore-console-log */
      console.debug('%c▼ %c[JSONRPC]', 'color: red', 'color:grey', message)
    }
    super._onmessage(message)
  }

  _send(message: yerpc.Message): void {
    super._send(message)
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

class BrowserDeltachat extends BaseDeltaChat<BrowserTransport> {
  close() {
    /** noop */
  }
  constructor(
    hasDebugEnabled: boolean,
    callCounterFunction: (label: string) => void
  ) {
    super(new BrowserTransport(hasDebugEnabled, callCounterFunction), true)
  }
}

class BrowserRuntime implements Runtime {
  socket: WebSocket
  private rc_config: RC_Config | null = null
  constructor() {
    this.socket = new WebSocket('wss://localhost:3000/ws/backend')

    this.socket.addEventListener('open', () => {
      console.log('WebSocket connection opened')
    })

    this.socket.addEventListener('message', event => {
      console.log('Received message from server:', event.data)
    })

    this.socket.addEventListener('close', () => {
      console.log('WebSocket connection closed')
    })

    this.socket.addEventListener('error', event => {
      console.error('WebSocket error:', event)
    })
  }

  sendToBackendOverWS(message: MessageToBackend.AllTypes) {
    if (this.socket.readyState != this.socket.OPEN) {
      /* ignore-console-log */
      console.warn(
        'sendToBackendOverWS can not send message to backend because websocket is not open'
      )
    } else {
      try {
        this.socket.send(JSON.stringify(message))
      } catch (error) {
        console.warn(
          'sendToBackendOverWS failed to send message to backend over websocket'
        )
      }
    }
  }

  onResumeFromSleep: (() => void) | undefined
  onChooseLanguage: ((locale: string) => Promise<void>) | undefined
  onThemeUpdate: (() => void) | undefined
  onShowDialog:
    | ((kind: 'about' | 'keybindings' | 'settings') => void)
    | undefined
  onOpenQrUrl: ((url: string) => void) | undefined
  onWebxdcSendToChat:
    | ((
        file: { file_name: string; file_content: string } | null,
        text: string | null
      ) => void)
    | undefined

  openMapsWebxdc(_accountId: number, _chatId?: number | undefined): void {
    throw new Error('Method not implemented.')
  }

  emitUIFullyReady(): void {
    this.sendToBackendOverWS({ type: 'UIReadyFrontendReady' })
  }
  onDragFileOut(_file: string): void {
    // Browser can not implement this
    return
  }
  isDroppedFileFromOutside(_file: File): boolean {
    return true // Browser does not support dragging files out, so can only be from outside
  }
  emitUIReady(): void {
    this.sendToBackendOverWS({ type: 'UIReady' })
  }
  createDeltaChatConnection(
    hasDebugEnabled: boolean,
    callCounterFunction: (label: string) => void
  ): BaseDeltaChat<any> {
    return new BrowserDeltachat(hasDebugEnabled, callCounterFunction)
  }
  openMessageHTML(
    _window_id: string,
    _accountId: number,
    _isContactRequest: boolean,
    _subject: string,
    _sender: string,
    _receiveTime: string,
    _content: string
  ): void {
    throw new Error('Method not implemented.')
  }
  notifyWebxdcStatusUpdate(_accountId: number, _instanceId: number): void {
    this.log.critical('Method not implemented.')
  }
  notifyWebxdcRealtimeData(
    _accountId: number,
    _instanceId: number,
    _payload: number[]
  ): void {
    this.log.critical('Method not implemented.')
  }
  notifyWebxdcMessageChanged(_accountId: number, _instanceId: number): void {
    this.log.critical('Method not implemented.')
  }
  notifyWebxdcInstanceDeleted(_accountId: number, _instanceId: number): void {
    this.log.critical('Method not implemented.')
  }
  saveBackgroundImage(
    _file: string,
    _isDefaultPicture: boolean
  ): Promise<string> {
    throw new Error('Method not implemented.')
  }
  async getLocaleData(locale?: string | undefined): Promise<LocaleData> {
    const messagesEnglish = await (await fetch('/locales/en.json')).json()
    const untranslated = await (
      await fetch('/locales/_untranslated_en.json')
    ).json()

    if (!locale) {
      return { locale: 'en', messages: { ...messagesEnglish, ...untranslated } }
    }

    let localeMessages: LocaleData['messages']
    try {
      localeMessages = await (await fetch(`/locales/${locale}.json`)).json()
    } catch (error1) {
      // We couldn't load the file for the locale but it's a dialect. Try to fall
      // back to the main language (example: de-CH -> de)
      try {
        if (locale.indexOf('-') !== -1) {
          const base_locale = (locale = locale.split('-')[0])

          localeMessages = await (
            await fetch(`/locales/${base_locale}.json`)
          ).json()
        } else {
          throw new Error(
            'language load failed, even alternative of base language failed.'
          )
        }
      } catch (error2) {
        this.log.error(
          `Could not load messages for ${locale}, falling back to english`,
          error1,
          error2
        )
        locale = 'en'
        localeMessages = messagesEnglish
      }
    }
    return { locale: 'en', messages: { ...localeMessages, ...untranslated } }
  }
  setLocale(_locale: string): Promise<void> {
    throw new Error('Method not implemented.')
  }
  async setDesktopSetting(
    key: keyof DesktopSettingsType,
    value: string | number | boolean | undefined
  ): Promise<void> {
    const request = await fetch(`/backend-api/config/${key}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ new_value: value }),
    })
    if (!request.ok) {
      throw new Error('setDesktopSettings request failed')
    }
  }
  getAvailableThemes(): Promise<Theme[]> {
    throw new Error('Method not implemented.')
  }
  async getActiveTheme(): Promise<{ theme: Theme; data: string } | null> {
    return null
  }
  resolveThemeAddress(_address: string): Promise<string> {
    this.log.critical('Method not implemented.')
    throw new Error('Method not implemented.')
  }
  async clearWebxdcDOMStorage(_accountId: number): Promise<void> {
    // not applicable in browser
    this.log.warn('clearWebxdcDOMStorage method does not exist in browser.')
  }
  getWebxdcDiskUsage(_accountId: number): Promise<{
    total_size: number
    data_size: number
  }> {
    // not applicable in browser
    throw new Error('getWebxdcDiskUsage method does not exist in browser.')
  }
  async writeClipboardToTempFile(): Promise<string> {
    throw new Error('Method not implemented.')
  }
  writeTempFileFromBase64(_name: string, _content: string): Promise<string> {
    throw new Error('Method not implemented.')
  }
  writeTempFile(_name: string, _content: string): Promise<string> {
    throw new Error('Method not implemented.')
  }
  removeTempFile(_name: string): Promise<void> {
    throw new Error('Method not implemented.')
  }
  setNotificationCallback(
    _cb: (data: { accountId: number; chatId: number; msgId: number }) => void
  ): void {
    this.log.critical('Method not implemented.')
  }
  showNotification(_data: DcNotification): void {
    this.log.critical('Method not implemented.')
  }
  clearAllNotifications(): void {
    this.log.critical('Method not implemented.')
  }
  clearNotifications(_chatId: number): void {
    this.log.critical('Method not implemented.')
  }
  setBadgeCounter(value: number): void {
    document.title = `DeltaChat${value ? `(${value})` : ''}`
  }
  deleteWebxdcAccountData(_accountId: number): Promise<void> {
    // not applicable in browser
    this.log.warn('deleteWebxdcAccountData method does not exist in browser.')
    return Promise.resolve()
  }
  closeAllWebxdcInstances(): void {
    this.log.critical('Method not implemented.')
  }
  restartApp(): void {
    this.log.critical('Method not implemented.')
  }
  private runtime_info: RuntimeInfo | null = null
  getRuntimeInfo(): RuntimeInfo {
    if (this.runtime_info === null) {
      throw new Error('this.runtime_info is not set')
    }
    return this.runtime_info
  }
  async getDesktopSettings(): Promise<DesktopSettingsType> {
    const request = await fetch('/backend-api/config')
    if (!request.ok) {
      throw new Error('getDesktopSettings request failed')
    }
    const config = await request.json()
    if (config.locale === null) {
      config.locale = navigator.language
    }
    return config
  }
  getWebxdcIconURL(_accountId: number, _msgId: number): string {
    this.log.critical('getWebxdcIconURL Method not implemented.')
    return 'not-implemented'
  }
  openWebxdc(_msgId: number, _params: DcOpenWebxdcParameters): void {
    throw new Error('Method not implemented.')
  }
  async openPath(path: string): Promise<string> {
    if (path.includes('dc.db-blobs')) {
      window.open(this.transformBlobURL(path), '_blank')?.focus()
      return ''
    } else {
      throw new Error(
        'Browser does not support opening urls outside of blob directory'
      )
    }
  }
  getAppPath(_name: string): string {
    this.log.critical('Method not implemented.')
    return 'not-implemented'
  }
  async downloadFile(pathToSource: string, filename: string): Promise<void> {
    if (pathToSource.includes('dc.db-blobs')) {
      window
        .open(
          this.transformBlobURL(pathToSource) +
            '?download_with_filename=' +
            encodeURIComponent(filename),
          '_blank'
        )
        ?.focus()
    } else {
      throw new Error(
        'Browser does not support opening urls outside of blob directory'
      )
    }
  }
  readClipboardText(): Promise<string> {
    return navigator.clipboard.readText()
  }
  async readClipboardImage(): Promise<string | null> {
    try {
      const clipboardItems = await navigator.clipboard.read()

      for (const clipboardItem of clipboardItems) {
        for (const type of clipboardItem.types) {
          if (type.startsWith('image')) {
            const blob = await clipboardItem.getType(type)
            return await new Promise((resolve, _) => {
              const reader = new FileReader()
              reader.onloadend = () => resolve(reader.result as any)
              reader.readAsDataURL(blob)
            })
          }
        }
      }
    } catch (err) {
      console.error('NotImageError', 'No Image Found')
    } finally {
      return null
    }
  }
  writeClipboardText(text: string): Promise<void> {
    return navigator.clipboard.writeText(text)
  }
  async writeClipboardImage(path: string): Promise<void> {
    try {
      const imgURL = this.transformBlobURL(path)
      const data = await fetch(imgURL);
      const blob = await data.blob();
      await navigator.clipboard.write([
        new ClipboardItem({
          [blob.type]: blob,
        }),
      ]);
      console.log("Fetched image copied.");
  } catch (err) {
    console.error('ClipboardError', "Couldn't write to clipboard");
  }
  }

  transformBlobURL(blob_path: string): string {
    const matches = blob_path.match(/.*(:?\\|\/)(.+?)\1dc.db-blobs\1(.*)/)
    // this.log.info({ transformBlobURL: blob_path, matches })
    if (matches) {
      return `/blobs/${matches[2]}/${matches[3]}`
    }
    this.log.error('transformBlobURL wrong url format', blob_path)
    return ''
  }
  async showOpenFileDialog(
    _options: RuntimeOpenDialogOptions
  ): Promise<string> {
    throw new Error('Method not implemented.')
  }

  openLink(link: string): void {
    window.open(link, '_blank')?.focus()
  }

  private log!: ReturnType<typeof getLoggerFunction>
  async initialize(
    setLogHandler: typeof setLogHandlerFunction,
    getLogger: typeof getLoggerFunction
  ): Promise<void> {
    this.log = getLogger('runtime/browser')

    const [RCConfigRequest, RuntimeInfoRequest] = await Promise.all([
      fetch('/backend-api/rc_config'),
      fetch('/backend-api/runtime_info'),
    ])

    if (!RCConfigRequest.ok || !RuntimeInfoRequest.ok) {
      throw new Error(
        'initialisation failed, look into network tab for more into'
      )
    }

    const config: RC_Config = (this.rc_config = await RCConfigRequest.json())
    /* ignore-console-log */
    console.info('RC_Config', config)
    this.runtime_info = await RuntimeInfoRequest.json()

    setLogHandler((channel, level, stack_trace, ...args) => {
      this.sendToBackendOverWS({
        type: 'log',
        data: [channel, level, stack_trace, ...args],
      })
    }, config)
  }
  getRC_Config(): RC_Config {
    if (this.rc_config === null) {
      throw new Error('this.rc_config is not set')
    }
    return this.rc_config
  }
  async openHelpWindow(anchor?: string): Promise<void> {
    const curLang = window.localeData.locale
    const response = await fetch(`/help_exists/${curLang}`)

    const anchorPath = anchor ? '#' + anchor : ''
    if (response.ok) {
      window.open(`/help/${curLang}/help.html${anchorPath}`, '_blank')?.focus()
    } else {
      window.open('/help/en/help.html' + anchorPath, '_blank')?.focus()
    }
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
    this.log.warn('getConfigPath method does not exist in browser.')
    return ''
  }
}

;(window as any).r = new BrowserRuntime()
