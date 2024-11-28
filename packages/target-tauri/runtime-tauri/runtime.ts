// This needs to be injected / imported before the frontend script

import { invoke } from '@tauri-apps/api/core'
import { listen } from '@tauri-apps/api/event'

import type { attachLogger } from '@tauri-apps/plugin-log'
import { getStore } from '@tauri-apps/plugin-store'
import type { Store } from '@tauri-apps/plugin-store'

import {
  DcNotification,
  DcOpenWebxdcParameters,
  DesktopSettingsType,
  PromiseType,
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

class TauriTransport extends yerpc.BaseTransport {
  constructor(
    private hasDebugEnabled: boolean,
    private callCounterFunction: (label: string) => void
  ) {
    super()

    listen<string>('dc-jsonrpc-message', event => {
      const message: yerpc.Message = JSON.parse(event.payload)
      if (hasDebugEnabled) {
        /* ignore-console-log */
        console.debug('%c▼ %c[JSONRPC]', 'color: red', 'color:grey', message)
      }
      this._onmessage(message)
    })
  }
  _send(message: yerpc.Message): void {
    const serialized = JSON.stringify(message)
    invoke('deltachat_jsonrpc_request', { message: serialized })
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

export class TauriDeltaChat extends BaseDeltaChat<TauriTransport> {
  constructor(
    hasDebugEnabled: boolean,
    callCounterFunction: (label: string) => void
  ) {
    super(new TauriTransport(hasDebugEnabled, callCounterFunction), true)
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
    hasDebugEnabled: boolean,
    callCounterFunction: (label: string) => void
  ): BaseDeltaChat<any> {
    return new TauriDeltaChat(hasDebugEnabled, callCounterFunction)
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
    } satisfies Partial<DesktopSettingsType>

    const frontendOnly = {
      // TODO field 2
      locale: null, // if this is null, the system chooses the system language that electron reports
      notifications: true,
      showNotificationContent: true,
      enterKeySends: false,
      enableCtrlUpToReplyShortcut: false,
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
      // these are not relevant for frontend (--version, --help and theur shorthand forms)
      version: false,
      v: false,
      help: false,
      h: false,
    }
    this.rc_config = rc_config
    // - runtime info
    const runtime_info: RuntimeInfo = {
      // TODO
      buildInfo: { VERSION: 'TODO', GIT_REF: 'todo', BUILD_TIMESTAMP: 0 },
      isAppx: false,
      isMac: false,
      versions: [],
      runningUnderARM64Translation: false,
      // static
      target: 'tauri',
      rpcServerPath: 'statically linked',
    }
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
        .slice(3) // removes non interessting stackframes

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
      console.log({ location })
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
  }
  reloadWebContent(): void {
    throw new Error('Method not implemented.7')
  }
  openLogFile(): void {
    throw new Error('Method not implemented.8')
  }
  currentLogFileLocation:string|null = null
  getCurrentLogLocation(): string {
    if (this.currentLogFileLocation === null) {
      throw new Error('this.currentLogFileLocation is not set')
    }
    return this.currentLogFileLocation
  }
  openHelpWindow(anchor?: string): void {
    throw new Error('Method not implemented.10')
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
    throw new Error('Method not implemented.13')
  }
  showOpenFileDialog(options: RuntimeOpenDialogOptions): Promise<string[]> {
    throw new Error('Method not implemented.14')
  }
  downloadFile(pathToSource: string, filename: string): Promise<void> {
    throw new Error('Method not implemented.15')
  }
  transformBlobURL(blob: string): string {
    // for now file scheme like electron, could be custom scheme in future
    // need to use custom protocol like the asset: protocol of convertFileSrc
    if (!blob) {
      return blob
    }
    const path_components = blob.replace(/\\/g, '/').split('/')
    const filename2 = path_components[path_components.length - 1]

    let new_blob_path

    if (decodeURIComponent(filename2) === filename2) {
      // if it is not already encoded then encode it.
      new_blob_path = blob.replace(filename2, encodeURIComponent(filename2))
    }
    return `file://${new_blob_path}`
  }
  readClipboardText(): Promise<string> {
    throw new Error('Method not implemented.17')
  }
  readClipboardImage(): Promise<string | null> {
    throw new Error('Method not implemented.18')
  }
  writeClipboardText(text: string): Promise<void> {
    throw new Error('Method not implemented.19')
  }
  writeClipboardImage(path: string): Promise<void> {
    throw new Error('Method not implemented.20')
  }
  getAppPath(name: RuntimeAppPath): string {
    throw new Error('Method not implemented.21')
  }
  openMapsWebxdc(accountId: number, chatId?: number): void {
    throw new Error('Method not implemented.22')
  }
  openPath(path: string): Promise<string> {
    throw new Error('Method not implemented.23')
  }
  getConfigPath(): string {
    throw new Error('Method not implemented.24')
  }
  openWebxdc(msgId: number, params: DcOpenWebxdcParameters): void {
    throw new Error('Method not implemented.25')
  }
  getWebxdcIconURL(accountId: number, msgId: number): string {
    return `webxdc-icon://${accountId}/${msgId}`
  }
  deleteWebxdcAccountData(accountId: number): Promise<void> {
    throw new Error('Method not implemented.27')
  }
  closeAllWebxdcInstances(): void {
    throw new Error('Method not implemented.28')
  }
  notifyWebxdcStatusUpdate(accountId: number, instanceId: number): void {
    invoke('on_webxdc_status_update', {accountId, instanceId})
  }
  notifyWebxdcRealtimeData(
    accountId: number,
    instanceId: number,
    payload: number[]
  ): void {
    invoke('on_webxdc_realtime_data', {accountId, instanceId, payload})
  }
  notifyWebxdcMessageChanged(accountId: number, instanceId: number): void {
    invoke('on_webxdc_message_changed', {accountId, instanceId})
  }
  notifyWebxdcInstanceDeleted(accountId: number, instanceId: number): void {
    invoke('on_webxdc_message_deleted', {accountId, instanceId})
  }
  restartApp(): void {
    throw new Error('Method not implemented.33')
  }
  async getLocaleData(locale?: string): Promise<LocaleData> {
    return await invoke('get_locale_data', {
      locale: locale || (await this.getDesktopSettings()).locale || "en",
    })
  }
  setLocale(locale: string): Promise<void> {
    throw new Error('Method not implemented.35')
  }
  setBadgeCounter(value: number): void {
    this.log.error(
      'setBadgeCounter: Method not implemented (36) -> this will come in one of the next tauri releases'
    )
  }
  showNotification(data: DcNotification): void {
    throw new Error('Method not implemented.37')
  }
  clearAllNotifications(): void {
    throw new Error('Method not implemented.38')
  }
  clearNotifications(chatId: number): void {
    this.log.error('Method not implemented.39 - clearNotifications')
  }
  setNotificationCallback(
    cb: (data: { accountId: number; chatId: number; msgId: number }) => void
  ): void {
    this.log.error('Method not implemented.40')
  }
  writeClipboardToTempFile(name?: string): Promise<string> {
    throw new Error('Method not implemented.41')
  }
  writeTempFileFromBase64(name: string, content: string): Promise<string> {
    throw new Error('Method not implemented.42')
  }
  writeTempFile(name: string, content: string): Promise<string> {
    throw new Error('Method not implemented.43')
  }
  removeTempFile(path: string): Promise<void> {
    throw new Error('Method not implemented.44')
  }
  getWebxdcDiskUsage(
    accountId: number
  ): Promise<{ total_size: number; data_size: number }> {
    throw new Error('Method not implemented.45')
  }
  clearWebxdcDOMStorage(accountId: number): Promise<void> {
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
    file: string,
    isDefaultPicture: boolean
  ): Promise<string> {
    throw new Error('Method not implemented.49')
  }
  onDragFileOut(file: string): void {
    throw new Error('Method not implemented.50')
  }
  isDroppedFileFromOutside(file: File): boolean {
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
