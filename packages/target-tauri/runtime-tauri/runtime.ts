// This needs to be injected / imported before the frontend script

import { invoke } from '@tauri-apps/api/core'
import { listen } from '@tauri-apps/api/event'

import type { attachLogger } from '@tauri-apps/plugin-log'

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
  getDesktopSettings(): Promise<DesktopSettingsType> {
    throw new Error('Method not implemented. 4')
  }
  setDesktopSetting(
    key: keyof DesktopSettingsType,
    value: string | number | boolean | undefined
  ): Promise<void> {
    throw new Error('Method not implemented. 5')
    // 1. set values in generic key value store
    // 2. if supported in tauri settings, then also set there (like tray_icon, but not experimental ui options)
  }
  private log!: ReturnType<typeof getLoggerFunction>
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
  }
  reloadWebContent(): void {
    throw new Error('Method not implemented.7')
  }
  openLogFile(): void {
    throw new Error('Method not implemented.8')
  }
  getCurrentLogLocation(): string {
    throw new Error('Method not implemented.9')
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
    throw new Error('Method not implemented.16')
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
    throw new Error('Method not implemented.26')
  }
  deleteWebxdcAccountData(accountId: number): Promise<void> {
    throw new Error('Method not implemented.27')
  }
  closeAllWebxdcInstances(): void {
    throw new Error('Method not implemented.28')
  }
  notifyWebxdcStatusUpdate(accountId: number, instanceId: number): void {
    throw new Error('Method not implemented.29')
  }
  notifyWebxdcRealtimeData(
    accountId: number,
    instanceId: number,
    payload: number[]
  ): void {
    throw new Error('Method not implemented.30')
  }
  notifyWebxdcMessageChanged(accountId: number, instanceId: number): void {
    throw new Error('Method not implemented.31')
  }
  notifyWebxdcInstanceDeleted(accountId: number, instanceId: number): void {
    throw new Error('Method not implemented.32')
  }
  restartApp(): void {
    throw new Error('Method not implemented.33')
  }
  getLocaleData(locale?: string): Promise<LocaleData> {
    throw new Error('Method not implemented.34')
  }
  setLocale(locale: string): Promise<void> {
    throw new Error('Method not implemented.35')
  }
  setBadgeCounter(value: number): void {
    throw new Error('Method not implemented.36')
  }
  showNotification(data: DcNotification): void {
    throw new Error('Method not implemented.37')
  }
  clearAllNotifications(): void {
    throw new Error('Method not implemented.38')
  }
  clearNotifications(chatId: number): void {
    throw new Error('Method not implemented.39')
  }
  setNotificationCallback(
    cb: (data: { accountId: number; chatId: number; msgId: number }) => void
  ): void {
    throw new Error('Method not implemented.40')
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
  getActiveTheme(): Promise<{ theme: Theme; data: string } | null> {
    throw new Error('Method not implemented.48')
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
