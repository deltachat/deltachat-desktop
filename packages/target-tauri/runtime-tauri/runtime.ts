// This needs to be injected / imported before the frontend script

import { invoke } from "@tauri-apps/api/core";

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
import type { getLogger as getLoggerFunction } from '@deltachat-desktop/shared/logger.js'
import type { setLogHandler as setLogHandlerFunction } from '@deltachat-desktop/shared/logger.js'


class TauriRuntime implements Runtime {
  emitUIFullyReady(): void {
    throw new Error('Method not implemented.')
  }
  emitUIReady(): void {
    throw new Error('Method not implemented.')
  }
  createDeltaChatConnection(hasDebugEnabled: boolean, callCounterFunction: (label: string) => void): BaseDeltaChat<any> {
    throw new Error('Method not implemented.')
  }
  openMessageHTML(window_id: string, accountId: number, isContactRequest: boolean, subject: string, sender: string, receiveTime: string, content: string): void {
    throw new Error('Method not implemented.')
  }
  getDesktopSettings(): Promise<DesktopSettingsType> {
    throw new Error('Method not implemented.')
  }
  setDesktopSetting(key: keyof DesktopSettingsType, value: string | number | boolean | undefined): Promise<void> {
    throw new Error('Method not implemented.')
  }
  initialize(setLogHandler: typeof setLogHandlerFunction, getLogger: typeof getLoggerFunction): Promise<void> {
    throw new Error('Method not implemented.')
  }
  reloadWebContent(): void {
    throw new Error('Method not implemented.')
  }
  openLogFile(): void {
    throw new Error('Method not implemented.')
  }
  getCurrentLogLocation(): string {
    throw new Error('Method not implemented.')
  }
  openHelpWindow(anchor?: string): void {
    throw new Error('Method not implemented.')
  }
  getRC_Config(): RC_Config {
    throw new Error('Method not implemented.')
  }
  getRuntimeInfo(): RuntimeInfo {
    throw new Error('Method not implemented.')
  }
  openLink(link: string): void {
    throw new Error('Method not implemented.')
  }
  showOpenFileDialog(options: RuntimeOpenDialogOptions): Promise<string[]> {
    throw new Error('Method not implemented.')
  }
  downloadFile(pathToSource: string, filename: string): Promise<void> {
    throw new Error('Method not implemented.')
  }
  transformBlobURL(blob: string): string {
    throw new Error('Method not implemented.')
  }
  readClipboardText(): Promise<string> {
    throw new Error('Method not implemented.')
  }
  readClipboardImage(): Promise<string | null> {
    throw new Error('Method not implemented.')
  }
  writeClipboardText(text: string): Promise<void> {
    throw new Error('Method not implemented.')
  }
  writeClipboardImage(path: string): Promise<void> {
    throw new Error('Method not implemented.')
  }
  getAppPath(name: RuntimeAppPath): string {
    throw new Error('Method not implemented.')
  }
  openMapsWebxdc(accountId: number, chatId?: number): void {
    throw new Error('Method not implemented.')
  }
  openPath(path: string): Promise<string> {
    throw new Error('Method not implemented.')
  }
  getConfigPath(): string {
    throw new Error('Method not implemented.')
  }
  openWebxdc(msgId: number, params: DcOpenWebxdcParameters): void {
    throw new Error('Method not implemented.')
  }
  getWebxdcIconURL(accountId: number, msgId: number): string {
    throw new Error('Method not implemented.')
  }
  deleteWebxdcAccountData(accountId: number): Promise<void> {
    throw new Error('Method not implemented.')
  }
  closeAllWebxdcInstances(): void {
    throw new Error('Method not implemented.')
  }
  notifyWebxdcStatusUpdate(accountId: number, instanceId: number): void {
    throw new Error('Method not implemented.')
  }
  notifyWebxdcRealtimeData(accountId: number, instanceId: number, payload: number[]): void {
    throw new Error('Method not implemented.')
  }
  notifyWebxdcMessageChanged(accountId: number, instanceId: number): void {
    throw new Error('Method not implemented.')
  }
  notifyWebxdcInstanceDeleted(accountId: number, instanceId: number): void {
    throw new Error('Method not implemented.')
  }
  restartApp(): void {
    throw new Error('Method not implemented.')
  }
  getLocaleData(locale?: string): Promise<LocaleData> {
    throw new Error('Method not implemented.')
  }
  setLocale(locale: string): Promise<void> {
    throw new Error('Method not implemented.')
  }
  setBadgeCounter(value: number): void {
    throw new Error('Method not implemented.')
  }
  showNotification(data: DcNotification): void {
    throw new Error('Method not implemented.')
  }
  clearAllNotifications(): void {
    throw new Error('Method not implemented.')
  }
  clearNotifications(chatId: number): void {
    throw new Error('Method not implemented.')
  }
  setNotificationCallback(cb: (data: { accountId: number; chatId: number; msgId: number }) => void): void {
    throw new Error('Method not implemented.')
  }
  writeClipboardToTempFile(name?: string): Promise<string> {
    throw new Error('Method not implemented.')
  }
  writeTempFileFromBase64(name: string, content: string): Promise<string> {
    throw new Error('Method not implemented.')
  }
  writeTempFile(name: string, content: string): Promise<string> {
    throw new Error('Method not implemented.')
  }
  removeTempFile(path: string): Promise<void> {
    throw new Error('Method not implemented.')
  }
  getWebxdcDiskUsage(accountId: number): Promise<{ total_size: number; data_size: number }> {
    throw new Error('Method not implemented.')
  }
  clearWebxdcDOMStorage(accountId: number): Promise<void> {
    throw new Error('Method not implemented.')
  }
  getAvailableThemes(): Promise<Theme[]> {
    throw new Error('Method not implemented.')
  }
  getActiveTheme(): Promise<{ theme: Theme; data: string } | null> {
    throw new Error('Method not implemented.')
  }
  saveBackgroundImage(file: string, isDefaultPicture: boolean): Promise<string> {
    throw new Error('Method not implemented.')
  }
  onDragFileOut(file: string): void {
    throw new Error('Method not implemented.')
  }
  isDroppedFileFromOutside(file: File): boolean {
    throw new Error('Method not implemented.')
  }
  onChooseLanguage: ((locale: string) => Promise<void>) | undefined
  onThemeUpdate: (() => void) | undefined
  onShowDialog: ((kind: 'about' | 'keybindings' | 'settings') => void) | undefined
  onOpenQrUrl: ((url: string) => void) | undefined
  onWebxdcSendToChat: ((file: { file_name: string; file_content: string } | null, text: string | null) => void) | undefined
  onResumeFromSleep: (() => void) | undefined

}

;(window as any).r = new TauriRuntime()
