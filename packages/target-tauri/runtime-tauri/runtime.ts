// This needs to be injected / imported before the frontend script

import { Channel, invoke } from '@tauri-apps/api/core'
import { getCurrentWindow } from '@tauri-apps/api/window'

import type { attachLogger } from '@tauri-apps/plugin-log'
import { getStore } from '@tauri-apps/plugin-store'
import type { Store } from '@tauri-apps/plugin-store'
import { openPath, openUrl } from '@tauri-apps/plugin-opener'
import { writeText, readText } from '@tauri-apps/plugin-clipboard-manager'

import type {
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

import type {
  DropListener,
  MediaAccessStatus,
  MediaType,
  Runtime,
  RuntimeAppPath,
} from '@deltachat-desktop/runtime-interface'

import { BaseDeltaChat, yerpc } from '@deltachat/jsonrpc-client'
import type { LocaleData } from '@deltachat-desktop/shared/localize.js'
import type {
  getLogger as getLoggerFunction,
  LogLevelString,
} from '@deltachat-desktop/shared/logger.js'
import type { setLogHandler as setLogHandlerFunction } from '@deltachat-desktop/shared/logger.js'
import { getCurrentWebview } from '@tauri-apps/api/webview'

let logJsonrpcConnection = false

type MainWindowEvents =
  | {
      event: 'sendToChat'
      data: {
        options: {
          text: string | null | undefined
          file: { fileName: string; fileContent: string } | null
        }
        account: number | null
      }
    }
  | {
      event: 'localeReloaded'
      data: string | null
    }
  | {
      event: 'showAboutDialog'
    }
  | {
      event: 'showSettingsDialog'
    }
  | {
      event: 'showKeybindingsDialog'
    }
  | {
      event: 'resumeFromSleep'
    }
  | {
      event: 'toggleNotifications'
    }
  | {
      event: 'onThemeUpdate'
    }
  | {
      event: 'notificationClick'
      data: { accountId: number; chatId: number; msgId: number }
    }
  | {
      event: 'deepLinkOpened'
      data: string
    }

const events = new Channel<MainWindowEvents>()
const jsonrpc = new Channel<yerpc.Message>()
invoke('set_main_window_channels', { jsonrpc, events })

class TauriTransport extends yerpc.BaseTransport {
  constructor(private callCounterFunction: (label: string) => void) {
    super()

    jsonrpc.onmessage = (message: yerpc.Message) => {
      if (logJsonrpcConnection) {
        // eslint-disable-next-line no-console
        console.debug('%c▼ %c[JSONRPC]', 'color: red', 'color:grey', message)
      }
      this._onmessage(message)
    }
  }
  _send(message: yerpc.Message): void {
    invoke('deltachat_jsonrpc_request', { message })
    if (logJsonrpcConnection) {
      // eslint-disable-next-line no-console
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

// Probably not super reliable, but we don't need it to be.
const isWindowsOS = navigator.userAgent.includes('Win')

class TauriRuntime implements Runtime {
  constructor() {
    this.getActiveTheme = this.getActiveTheme.bind(this)
  }
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
    accountId: number,
    messageId: number,
    isContactRequest: boolean,
    subject: string,
    sender: string,
    receiveTime: string,
    content: string
  ): void {
    invoke('open_html_window', {
      accountId,
      messageId,
      isContactRequest,
      subject,
      sender,
      receiveTime,
      content,
    })
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
      zoomFactor: 1, // ? not sure yet
      minimizeToTray: true,
      lastSaveDialogLocation: undefined,
      enableWebxdcDevTools: false, // likely impossible in mac appstore version, either hide setting there or use sth like eruda js to fill the gap?
      HTMLEmailAskForRemoteLoadingConfirmation: true,
      HTMLEmailAlwaysLoadRemoteContent: false,
      contentProtectionEnabled: false,
      activeTheme: 'system',
      locale: null, // if this is null, the system chooses the system language that electron reports
      notifications: true,
      syncAllAccounts: true,
      autostart: true,
    } satisfies Partial<DesktopSettingsType>

    const frontendOnly = {
      showNotificationContent: true,
      enterKeySends: false,
      enableAVCallsV2: false,
      enableBroadcastLists: false,
      enableOnDemandLocationStreaming: false,
      chatViewBgImg: undefined,
      galleryImageKeepAspectRatio: false,
      isMentionsEnabled: false,
      inChatSoundsVolume: 0.5,
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
    if (typeof value === 'undefined') {
      await this.store.delete(key)
    } else {
      await this.store.set(key, value)
    }
    // 2. if supported in tauri settings, then also notifiy tauri (like tray_icon, but not experimental ui options)
    await invoke('change_desktop_settings_apply_side_effects', { key })
  }
  private log!: ReturnType<typeof getLoggerFunction>
  private store!: Store
  async initialize(
    setLogHandler: typeof setLogHandlerFunction,
    getLogger: typeof getLoggerFunction
  ): Promise<void> {
    // fetch vars
    const config = await invoke<{
      log_debug: boolean
      log_to_console: boolean
      devtools: boolean
      dev_mode: boolean
      forced_tray_icon: boolean
      theme: string | null
      theme_watch: boolean
    }>('get_frontend_run_config')
    const rc_config: RC_Config = {
      'log-debug': config.log_debug,
      'log-to-console': config.log_to_console,
      devmode: config.dev_mode,
      minimized: config.forced_tray_icon,

      theme: config.theme || undefined,
      'theme-watch': config.theme_watch,
      'translation-watch': false,

      // does not exist in delta tauri
      'allow-unsafe-core-replacement': false,
      'machine-readable-stacktrace': true,
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
      location = `:JS::${channel.replace(/\//g, '::')}${
        onlyFnName ? `::${onlyFnName}` : ''
      }`

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

    events.onmessage = event => {
      if (event.event === 'sendToChat') {
        const { options, account } = event.data
        this.onWebxdcSendToChat?.(
          options.file
            ? {
                file_name: options.file.fileName,
                file_content: options.file.fileContent,
              }
            : null,
          options.text || null,
          account || undefined
        )
      } else if (event.event === 'localeReloaded') {
        // event.data is only null in case of reloading via --watch-translations
        this.onChooseLanguage?.(event.data || window.localeData.locale)
      } else if (event.event === 'showAboutDialog') {
        this.onShowDialog?.('about')
      } else if (event.event === 'showSettingsDialog') {
        this.onShowDialog?.('settings')
      } else if (event.event === 'showKeybindingsDialog') {
        this.onShowDialog?.('keybindings')
      } else if (event.event === 'resumeFromSleep') {
        this.onResumeFromSleep?.()
      } else if (event.event === 'toggleNotifications') {
        this.onToggleNotifications?.()
      } else if (event.event === 'onThemeUpdate') {
        this.log.debug('on theme update')
        this.onThemeUpdate?.()
      } else if (event.event === 'deepLinkOpened') {
        this.onOpenQrUrl?.(event.data)
      } else if (event.event === 'notificationClick') {
        this.notificationCallback?.(event.data)
      }
    }
    getCurrentWebview().onDragDropEvent(event => {
      if (event.payload.type === 'drop') {
        if (event.payload.paths.includes(this.lastDragOutFile || '')) {
          this.log.info('prevented dropping a file that we just draged out')
          return
        }
        // IDEA we could check element bounds and drop location, to only let you drop on chatview
        this.onDrop?.handler(event.payload.paths)
      }
      // IDEA: there are also enter and over events with a position,
      // we could use to show an drop overlay explaining the feature
    })
    window
      .matchMedia('(prefers-color-scheme: dark)')
      .addEventListener('change', event => {
        this.log.debug('system theme changed:', { dark_theme: event.matches })
        this.onThemeUpdate?.()
      })
  }
  reloadWebContent(): void {
    // for now use the browser method as long as it is sufficient
    // this method is used for reload button on crash screen
    location.reload()
  }
  openLogFile(): void {
    openPath(this.getCurrentLogLocation())
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
    if (
      link.toLowerCase().startsWith('http:') ||
      link.toLowerCase().startsWith('https:')
    ) {
      openUrl(link)
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
      // Currently encoding is unnecessary, because file names are
      // hex strings + file extension,
      // but let's do it for consistency with `transformStickerURL`,
      // and some future-proofing.
      const filename = encodeURIComponent(matches[3])
      return `${this.runtime_info?.tauriSpecific?.scheme.blobs}${matches[2]}/${filename}`
    }
    if (blob_path !== '') {
      this.log.error('transformBlobURL wrong url format', blob_path)
    } else {
      this.log.debug('transformBlobURL called with empty string for blob_path')
    }
    return ''
  }
  transformStickerURL(sticker_path: string): string {
    const matches = sticker_path.match(
      /.*(:?\\|\/)(.+?)\1stickers\1(.+?)\1(.+)/
    )
    // this.log.info({ transformStickerURL: sticker_path, matches })

    if (matches) {
      // Keep in mind that the sticker pack folder and sticker name
      // can include arbitrary characters.
      const packName = encodeURIComponent(matches[3])
      const filename = encodeURIComponent(matches[4])
      return `${this.runtime_info?.tauriSpecific?.scheme.stickers}${matches[2]}/${packName}/${filename}`
    }
    if (sticker_path !== '') {
      this.log.error('transformStickerURL wrong url format', sticker_path)
    } else {
      this.log.debug(
        'transformStickerURL called with empty string for sticker_path'
      )
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
  writeClipboardImage(path: string): Promise<void> {
    return invoke('copy_image_to_clipboard', { path })
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
      await openPath(path)
      return ''
    } catch (error: any) {
      this.log.error('openPath', path, error)
      return error?.message || error.toString()
    }
  }
  getConfigPath(): string {
    throw new Error('Method not implemented.24')
  }
  openWebxdc(messageId: number, params: DcOpenWebxdcParameters): void {
    invoke('open_webxdc', {
      messageId,
      accountId: params.accountId,
      href: params.href,
    })
  }
  getWebxdcIconURL(accountId: number, msgId: number): string {
    return `${this.runtime_info?.tauriSpecific?.scheme.webxdcIcon}${accountId}/${msgId}`
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
  startOutgoingVideoCall(): void {
    throw new Error('Method not implemented.101')
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
    return invoke('change_lang', { locale })
  }
  setBadgeCounter(value: number): void {
    const window = getCurrentWindow()

    // According to the docs, `setBadgeCount` is unsupported on Windows,
    // and we should use `setOverlayIcon` instead.
    window.setBadgeCount(value === 0 ? undefined : value)
    if (isWindowsOS) {
      // Yes, this won't show the count.
      window.setOverlayIcon?.(
        value === 0 ? undefined : 'images/tray/unread-badge.png'
      )
    }

    invoke('update_tray_icon_badge', { counter: value })
  }
  showNotification({
    title,
    body,
    icon,
    iconIsAvatar,
    chatId,
    messageId,
    accountId,
  }: DcNotification): void {
    invoke('show_notification', {
      title,
      body,
      icon,
      iconIsAvatar: iconIsAvatar || false,
      chatId,
      messageId,
      accountId,
    })
  }
  clearAllNotifications(): void {
    invoke('clear_all_notifications')
  }
  clearNotifications(accountId: number, chatId: number): void {
    invoke('clear_notifications', { accountId, chatId })
  }

  notificationCallback?: (data: {
    accountId: number
    chatId: number
    msgId: number
  }) => void
  setNotificationCallback(
    cb: (data: { accountId: number; chatId: number; msgId: number }) => void
  ): void {
    this.notificationCallback = cb
  }
  writeTempFileFromBase64(name: string, content: string): Promise<string> {
    return invoke('write_temp_file_from_base64', { name, content })
  }
  writeTempFile(name: string, content: string): Promise<string> {
    return invoke('write_temp_file', { name, content })
  }
  copyFileToInternalTmpDir(
    fileName: string,
    sourcePath: string
  ): Promise<string> {
    return invoke('copy_blob_file_to_internal_tmp_dir', {
      fileName,
      sourcePath,
    })
  }

  removeTempFile(path: string): Promise<void> {
    return invoke('remove_temp_file', { path })
  }

  getAvailableThemes(): Promise<Theme[]> {
    return invoke<Theme[]>('get_available_themes')
  }
  async getActiveTheme(): Promise<{ theme: Theme; data: string } | null> {
    let themeAddress = await invoke<string>('get_current_active_theme_address')
    if (themeAddress === 'system') {
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        themeAddress = 'dc:dark'
      } else {
        themeAddress = 'dc:light'
      }
    }
    try {
      const [theme, theme_content] = await invoke<
        [theme: Theme, theme_content: string]
      >('get_theme', { themeAddress })
      return { theme, data: theme_content }
    } catch (err) {
      this.log.error('failed to getActiveTheme:', err)
      return null
    }
  }
  saveBackgroundImage(
    srcPath: string,
    isDefaultPicture: boolean
  ): Promise<string> {
    return invoke('copy_background_image_file', { srcPath, isDefaultPicture })
  }
  lastDragOutFile?: string
  onDrop: DropListener | null = null
  setDropListener(onDrop: DropListener | null) {
    this.onDrop = onDrop
  }
  onDragFileOut(fileName: string): void {
    this.lastDragOutFile = fileName
    invoke('drag_file_out', { fileName })
  }
  isDroppedFileFromOutside(file: string): boolean {
    this.log.debug('isDroppedFileFromOutside', file)
    this.log.info(this.lastDragOutFile, file)
    return this.lastDragOutFile !== file
  }
  // only works on macOS and iOS
  // exp.runtime.debug_get_datastore_ids()
  async debug_get_datastore_ids() {
    return await invoke('debug_get_datastore_ids')
  }
  getAutostartState(): Promise<AutostartState> {
    return invoke('get_autostart_state')
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
        text: string | null,
        account_id?: number
      ) => void)
    | undefined
  onResumeFromSleep: (() => void) | undefined
  onToggleNotifications: (() => void) | undefined
  checkMediaAccess(mediaType: MediaType): Promise<MediaAccessStatus> {
    return invoke('check_media_permission', {
      permission: mediaTypeToPermission[mediaType],
    })
  }
  askForMediaAccess(mediaType: MediaType): Promise<boolean> {
    return invoke('request_media_permission', {
      permission: mediaTypeToPermission[mediaType],
    })
  }
}
const mediaTypeToPermission: Record<MediaType, string> = {
  camera: 'video',
  microphone: 'audio',
}

;(window as any).r = new TauriRuntime()
