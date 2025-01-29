// This needs to be injected / imported before the frontend script

import { invoke } from '@tauri-apps/api/core'
import { listen } from '@tauri-apps/api/event'
import { getCurrentWindow } from '@tauri-apps/api/window'

import type { attachLogger } from '@tauri-apps/plugin-log'
import { getStore } from '@tauri-apps/plugin-store'
import type { Store } from '@tauri-apps/plugin-store'
import { open } from '@tauri-apps/plugin-shell'
import {
  writeText,
  readText,
  readImage,
} from '@tauri-apps/plugin-clipboard-manager'

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

import { Runtime, RuntimeAppPath } from '@deltachat-desktop/runtime-interface'
import { BaseDeltaChat, yerpc } from '@deltachat/jsonrpc-client'
import type { LocaleData } from '@deltachat-desktop/shared/localize.js'
import type {
  getLogger as getLoggerFunction,
  LogLevelString,
} from '@deltachat-desktop/shared/logger.js'
import type { setLogHandler as setLogHandlerFunction } from '@deltachat-desktop/shared/logger.js'


let logJsonrpcConnection = false

class TauriTransport extends yerpc.BaseTransport {
  constructor(private callCounterFunction: (label: string) => void) {
    super()

    listen<string>('dc-jsonrpc-message', event => {
      const message: yerpc.Message = JSON.parse(event.payload)
      if (logJsonrpcConnection) {
        /* ignore-console-log */
        console.debug('%c▼ %c[JSONRPC]', 'color: red', 'color:grey', message)
      }
      this._onmessage(message)
    })
  }
  _send(message: yerpc.Message): void {
    const serialized = JSON.stringify(message)
    invoke('deltachat_jsonrpc_request', { message: serialized })
    if (logJsonrpcConnection) {
      /* ignore-console-log */
      console.debug('%c▲ %c[JSONRPC]', 'color: green', 'color:grey', message)
      if ((message as any)['method']) {
        this.callCounterFunction((message as any).method)
        this.callCounterFunction('total')
      }
    }
  }
}

export class TauriDeltaChat extends BaseDeltaChat<TauriTransport> {
  constructor(callCounterFunction: (label: string) => void) {
    super(new TauriTransport(callCounterFunction), true)
  }
}

class TauriRuntime implements Runtime {
  emitUIFullyReady(): void {
    invoke('ui_frontend_ready')
  }
  emitUIReady(): void {
    invoke('ui_ready')
  }
  createDeltaChatConnection(
    callCounterFunction: (label: string) => void
  ): BaseDeltaChat<any> {
    return new TauriDeltaChat(callCounterFunction)
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
    throw new Error('Method not implemented. 3')
  }
  async getDesktopSettings(): Promise<DesktopSettingsType> {
    // static not saved - not needed anymore besides cleaning up values in electron version
    const deprecated = {
      credentials: undefined,
      lastAccount: undefined,
      lastChats: {},
    } satisfies Partial<DesktopSettingsType>
    // static not saved - not needed in tauri version
    const static_backend = {
      ...deprecated,
      bounds: {}, // managed by tauri_plugin_window_state plugin
      HTMLEmailWindowBounds: undefined, // managed by tauri_plugin_window_state plugin
    } satisfies Partial<DesktopSettingsType>

    const frontendAndTauri = {
      // TODO field 1
      zoomFactor: 1, // ? not sure yet
      minimizeToTray: true,
      lastSaveDialogLocation: undefined,
      enableWebxdcDevTools: false, // likely impossible in mac appstore version, either hide setting there or use sth like eruda js to fill the gap?
      HTMLEmailAskForRemoteLoadingConfirmation: true,
      HTMLEmailAlwaysLoadRemoteContent: false,
      contentProtectionEnabled: false,
      locale: null, // if this is null, the system chooses the system language that electron reports
    } satisfies Partial<DesktopSettingsType>

    const frontendOnly = {
      // TODO field 2
      notifications: true,
      showNotificationContent: true,
      enterKeySends: false,
      enableAVCalls: false,
      enableBroadcastLists: false,
      enableChatAuditLog: false,
      enableOnDemandLocationStreaming: false,
      chatViewBgImg: undefined,
      activeTheme: 'system',
      syncAllAccounts: true,
      experimentalEnableMarkdownInMessages: false,
      enableRelatedChats: false,
      galleryImageKeepAspectRatio: false,
      isMentionsEnabled: false,
      useSystemUIFont: false,
    } satisfies Partial<DesktopSettingsType>

    const savedEntries = (await this.store.entries()).reduce(
      (acc, [key, value]) => {
        ;(acc as any)[key] = value
        return acc
      },
      {} as Partial<DesktopSettingsType>
    )

    return {
      ...static_backend,
      ...frontendAndTauri,
      ...frontendOnly,
      ...savedEntries,
    } satisfies DesktopSettingsType
  }
  async setDesktopSetting(
    key: keyof DesktopSettingsType,
    value: string | number | boolean | undefined
  ): Promise<void> {
    // 1. set values in key value store
    await this.store.set(key, value)
    // 2. if supported in tauri settings, then also notifiy tauri (like tray_icon, but not experimental ui options)
    // IDEA: if there is a way to listen for changes in rust code, then that would be preferably?
  }
  private log!: ReturnType<typeof getLoggerFunction>
  private store!: Store
  async initialize(
    setLogHandler: typeof setLogHandlerFunction,
    getLogger: typeof getLoggerFunction
  ): Promise<void> {
    // fetch vars
    // - rc config // TODO - get real values // todo also cli interface?
    const rc_config: RC_Config = {
      'log-debug': true,
      'log-to-console': true,
      'machine-readable-stacktrace': true,
      theme: undefined,
      'theme-watch': false,
      devmode: true,
      'translation-watch': false,
      minimized: false,

      // does not exist in delta tauri
      'allow-unsafe-core-replacement': false,
      // these are not relevant for frontend (--version, --help and their shorthand forms)
      version: false,
      v: false,
      help: false,
      h: false,
    }
    this.rc_config = rc_config
    if (rc_config['log-debug']) {
      logJsonrpcConnection = true
    }
    // - runtime info
    const runtime_info: RuntimeInfo = await invoke('get_runtime_info')
    this.runtime_info = runtime_info

    type TauriLogVariants = Parameters<
      Parameters<typeof attachLogger>[0]
    >[0]['level']

    const variants: Record<LogLevelString, TauriLogVariants> = {
      DEBUG: 2,
      INFO: 3,
      WARNING: 4,
      ERROR: 5,
      CRITICAL: 5,
    }

    setLogHandler((channel, level, _stack_trace, ...args) => {
      const message = args
        .map(arg => (typeof arg === 'object' ? JSON.stringify(arg) : arg))
        .join(', ')

      // this code was partially taken from @tauri-apps/plugin-log then modified for our usecase
      const traces = new Error().stack
        ?.split('\n')
        .map(line => line.split('@'))
        .slice(3) // removes non interesting stackframes

      const filtered = traces?.filter(([name, location]) => {
        return name.length > 0 && location !== '[native code]'
      })
      let location = filtered?.[0]?.filter(v => v.length > 0).join('@')
      if (location === 'Error') {
        location = 'webview::unknown'
      }

      // Format location similar to the rust location
      // the channel is normally a "file" / "module"
      // the method name is relevant
      // and the location in file is bundled,
      // so the shown file location is not very helpful most of the time,
      // still for errors the stack trace is appended
      const onlyFnName = location?.split('@')[0]
      location = `JS ${channel}${onlyFnName ? `::${onlyFnName}` : ''}`

      const tauriLogLevel = variants[level]
      invoke('plugin:log|log', {
        level: tauriLogLevel,
        message,
        location,
        file: undefined,
        line: undefined,
        keyValues:
          tauriLogLevel <= variants.ERROR
            ? { stack_trace: JSON.stringify(traces) }
            : undefined,
      })
    }, rc_config)

    this.log = getLogger('runtime/tauri')
    const store = await getStore('config.json')
    if (!store) {
      throw new Error('Configuration Store was not loaded')
    }
    this.store = store
    this.currentLogFileLocation = await invoke('get_current_logfile')

    listen<string>('locale_reloaded', (event) => {
      this.onChooseLanguage?.(event.payload)
    });
  }
  reloadWebContent(): void {
    // for now use the browser method as long as it is sufficient
    // this method is used for reload button on crash screen
    location.reload()
  }
  openLogFile(): void {
    open(this.getCurrentLogLocation())
  }
  currentLogFileLocation: string | null = null
  getCurrentLogLocation(): string {
    if (this.currentLogFileLocation === null) {
      throw new Error('this.currentLogFileLocation is not set')
    }
    return this.currentLogFileLocation
  }
  openHelpWindow(anchor?: string): void {
    invoke('open_help_window', { locale: window.localeData.locale, anchor })
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
  openLink(link: string): void {
    if (link.startsWith('http:') || link.startsWith('https:')) {
      open(link)
    } else {
      this.log.error('tried to open a non http/https external link', {
        link,
      })
    }
  }
  async showOpenFileDialog(
    options: RuntimeOpenDialogOptions
  ): Promise<string[]> {
    return await invoke('show_open_file_dialog', {
      title: options.title,
      filters: options.filters,
      properties: options.properties,
      defaultPath: options.defaultPath,
      // buttonLabel: options.buttonLabel, // not supported by tauri
    })
  }
  async downloadFile(pathToSource: string, filename: string): Promise<void> {
    await invoke('download_file', { pathToSource, filename })
  }
  transformBlobURL(blob_path: string): string {
    const matches = blob_path.match(/.*(:?\\|\/)(.+?)\1dc.db-blobs\1(.*)/)
    // this.log.info({ transformBlobURL: blob_path, matches })

    if (matches) {
      let filename = matches[3]
      if (decodeURIComponent(filename) === filename) {
        // if it is not already encoded then encode it.
        filename = encodeURIComponent(filename)
      }
      return `dcblob://${matches[2]}/${matches[3]}`
    }
    if (blob_path !== '') {
      this.log.error('transformBlobURL wrong url format', blob_path)
    } else {
      this.log.debug('transformBlobURL called with empty string for blob_path')
    }
    return ''
  }
  readClipboardText(): Promise<string> {
    return readText()
  }
  readClipboardImage(): Promise<string | null> {
    return invoke('get_clipboard_image_as_data_uri')
  }
  writeClipboardText(text: string): Promise<void> {
    return writeText(text)
  }
  writeClipboardImage(_path: string): Promise<void> {
    throw new Error('Method not implemented.20')
  }
  getAppPath(name: RuntimeAppPath): Promise<string> {
    // defined in packages/target-tauri/src-tauri/src/app_path.rs
    // look there if some path is not implemented
    return invoke('get_app_path', { name })
  }
  openMapsWebxdc(_accountId: number, _chatId?: number): void {
    throw new Error('Method not implemented.22')
  }
  async openPath(path: string): Promise<string> {
    try {
      await open(path)
      return ''
    } catch (error: any) {
      this.log.error('openPath', path, error)
      return error?.message || error.toString()
    }
  }
  getConfigPath(): string {
    throw new Error('Method not implemented.24')
  }
  openWebxdc(_msgId: number, _params: DcOpenWebxdcParameters): void {
    throw new Error('Method not implemented.25')
  }
  getWebxdcIconURL(accountId: number, msgId: number): string {
    return `webxdc-icon://${accountId}/${msgId}`
  }
  deleteWebxdcAccountData(accountId: number): Promise<void> {
    return invoke('delete_webxdc_account_data', { accountId })
  }
  closeAllWebxdcInstances(): void {
    invoke('close_all_webxdc_instances')
  }
  notifyWebxdcStatusUpdate(accountId: number, instanceId: number): void {
    invoke('on_webxdc_status_update', { accountId, instanceId })
  }
  notifyWebxdcRealtimeData(
    accountId: number,
    instanceId: number,
    payload: number[]
  ): void {
    invoke('on_webxdc_realtime_data', { accountId, instanceId, payload })
  }
  notifyWebxdcMessageChanged(accountId: number, instanceId: number): void {
    invoke('on_webxdc_message_changed', { accountId, instanceId })
  }
  notifyWebxdcInstanceDeleted(accountId: number, instanceId: number): void {
    invoke('on_webxdc_message_deleted', { accountId, instanceId })
  }
  restartApp(): void {
    // will not be implemented in tauri for now, as this method is currently unused
    this.log.error('Method not implemented: restartApp')
  }
  async getLocaleData(locale?: string): Promise<LocaleData> {
    return await invoke('get_locale_data', {
      locale: locale || (await this.getDesktopSettings()).locale || 'en',
    })
  }
  setLocale(locale: string): Promise<void> {
    return invoke('change_lang', {locale});
  }
  setBadgeCounter(value: number): void {
    getCurrentWindow().setBadgeCount(value === 0 ? undefined : value)
  }
  showNotification(_data: DcNotification): void {
    throw new Error('Method not implemented.37')
  }
  clearAllNotifications(): void {
    throw new Error('Method not implemented.38')
  }
  clearNotifications(_chatId: number): void {
    this.log.error('Method not implemented.39 - clearNotifications')
  }
  setNotificationCallback(
    _cb: (data: { accountId: number; chatId: number; msgId: number }) => void
  ): void {
    this.log.error('Method not implemented.40')
  }
  writeTempFileFromBase64(name: string, content: string): Promise<string> {
    return invoke('write_temp_file_from_base64', { name, content })
  }
  writeTempFile(name: string, content: string): Promise<string> {
    return invoke('write_temp_file', { name, content })
  }
  copyFileToInternalTmpDir(
    _fileName: string,
    _sourcePath: string
  ): Promise<string> {
    throw new Error('Method not implemented.44')
  }

  removeTempFile(path: string): Promise<void> {
    return invoke('remove_temp_file', { path })
  }
  getWebxdcDiskUsage(
    _accountId: number
  ): Promise<{ total_size: number; data_size: number }> {
    // will not be implemented in tauri for now, as this method is currently unused
    throw new Error('Method not implemented: runtime.getWebxdcDiskUsage')
  }
  clearWebxdcDOMStorage(_accountId: number): Promise<void> {
    // will not be implemented in tauri for now, as this method is currently unused
    // Also isn't this function essentially a duplicate of `this.deleteWebxdcAccountData`?
    throw new Error('Method not implemented.46')
  }
  getAvailableThemes(): Promise<Theme[]> {
    throw new Error('Method not implemented.47')
  }
  async getActiveTheme(): Promise<{ theme: Theme; data: string } | null> {
    this.log.error('Method not implemented.48')
    return null
  }
  saveBackgroundImage(
    _file: string,
    _isDefaultPicture: boolean
  ): Promise<string> {
    throw new Error('Method not implemented.49')
  }
  onDragFileOut(_file: string): void {
    throw new Error('Method not implemented.50')
  }
  isDroppedFileFromOutside(_file: File): boolean {
    throw new Error('Method not implemented.51')
  }
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
  onResumeFromSleep: (() => void) | undefined
}

;(window as any).r = new TauriRuntime()
