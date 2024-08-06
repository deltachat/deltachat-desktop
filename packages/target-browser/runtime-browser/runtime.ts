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

import { LocaleData } from '@deltachat-desktop/shared/localize.js'
import { Runtime } from '@deltachat-desktop/runtime-interface'
import { BaseDeltaChat } from '@deltachat/jsonrpc-client'

import type { getLogger as getLoggerFunction } from '@deltachat-desktop/shared/logger.js'
import type { setLogHandler as setLogHandlerFunction } from '@deltachat-desktop/shared/logger.js'

class BrowserRuntime implements Runtime {
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
    throw new Error('Method not implemented.')
  }
  onDragFileOut(_file: string): void {
    // Browser can not implement this
    return
  }
  isDroppedFileFromOutside(_file: File): boolean {
    return true // Browser does not support dragging files out, so can only be from outside
  }
  emitUIReady(): void {
    throw new Error('Method not implemented.')
  }
  createDeltaChatConnection(
    _hasDebugEnabled: boolean,
    _callCounterFunction: (label: string) => void
  ): BaseDeltaChat<any> {
    throw new Error('Method not implemented.')
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
    throw new Error('Method not implemented.')
  }
  notifyWebxdcRealtimeData(
    _accountId: number,
    _instanceId: number,
    _payload: number[]
  ): void {
    throw new Error('Method not implemented.')
  }
  notifyWebxdcMessageChanged(_accountId: number, _instanceId: number): void {
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
  getWebxdcDiskUsage(_accountId: number): Promise<{
    total_size: number
    data_size: number
  }> {
    throw new Error('Method not implemented.')
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
    this.log.warn('setBadgeCounter is not implemented for browser')
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
  downloadFile(_pathToSource: string, _filename: string): Promise<void> {
    throw new Error('Method not implemented.')
  }
  async readClipboardText(): Promise<string> {
    throw new Error('Method not implemented.')
  }
  async readClipboardImage(): Promise<string | null> {
    throw new Error('Method not implemented.')
  }
  writeClipboardText(_text: string): Promise<void> {
    throw new Error('Method not implemented.')
  }
  writeClipboardImage(_path: string): Promise<void> {
    throw new Error('Method not implemented.')
  }
  transformBlobURL(_blob: string): string {
    throw new Error('Method not implemented.')
  }
  async showOpenFileDialog(
    _options: RuntimeOpenDialogOptions
  ): Promise<string> {
    throw new Error('Method not implemented.')
  }
  openLink(_link: string): void {
    throw new Error('Method not implemented.')
  }

  private log!: ReturnType<typeof getLoggerFunction>
  initialize(setLogHandler: typeof setLogHandlerFunction, getLogger: typeof getLoggerFunction): void {
    this.log = getLogger('runtime/browser')
    throw new Error('Method not implemented.')
  }
  getRC_Config(): RC_Config {
    throw new Error('Method not implemented.')
  }
  openHelpWindow(_anchor?: string): void {
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

;(window as any).r = new BrowserRuntime()
