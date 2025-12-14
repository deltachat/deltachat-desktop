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
import { LocaleData } from '@deltachat-desktop/shared/localize.js'
import { BaseDeltaChat } from '@deltachat/jsonrpc-client'

import type { getLogger as getLoggerFunction } from '@deltachat-desktop/shared/logger.js'
import type { setLogHandler as setLogHandlerFunction } from '@deltachat-desktop/shared/logger.js'

export type MediaType = 'microphone' | 'camera'
export type MediaAccessStatus =
  | 'not-determined'
  | 'granted'
  | 'denied'
  | 'restricted'
  | 'unknown'

export type DropListener = {
  /** element that gets compared against the event target,
  either by bounds or by event target path */
  elementRef: { current: HTMLElement | null } // I don't want to import add react to dependencies just for this
  handler: (paths: string[]) => void
}

/**
 * Offers an abstraction Layer to make it easier to capsulate
 * context specific functions (like electron, browser, tauri, etc)
 */
export interface Runtime {
  emitUIFullyReady(): void
  emitUIReady(): void
  createDeltaChatConnection(
    callCounterFunction: (label: string) => void
  ): BaseDeltaChat<any>
  /**
   * open html message, in dedicated window or in system browser
   * @param subject subject of the email (or start of message, if we don't have a subject?)
   * @param sender sender display name
   * @param content content of the html mail
   */
  openMessageHTML(
    accountId: number,
    messageId: number,
    isContactRequest: boolean,
    subject: string,
    sender: string,
    receiveTime: string,
    content: string
  ): void
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
  initialize(
    setLogHandler: typeof setLogHandlerFunction,
    getLogger: typeof getLoggerFunction
  ): Promise<void>
  reloadWebContent(): void
  openLogFile(): void
  getCurrentLogLocation(): string
  /** Opens the help window at the specified anchor.
   *  Anchor needs to be written without the prefixed `#` */
  openHelpWindow(anchor?: string): void
  /**
   * get the commandline arguments
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
  showOpenFileDialog(options: RuntimeOpenDialogOptions): Promise<string[]>
  downloadFile(pathToSource: string, filename: string): Promise<void>
  transformBlobURL(blob: string): string
  transformStickerURL(sticker_path: string): string
  readClipboardText(): Promise<string>
  /**
   * @returns promise that resolves into base64 encoded image string
   * or null when no image was given from clipboard
   */
  readClipboardImage(): Promise<string | null>
  writeClipboardText(text: string): Promise<void>
  writeClipboardImage(path: string): Promise<void>
  getAppPath(name: RuntimeAppPath): Promise<string>
  openMapsWebxdc(accountId: number, chatId?: number): void
  /** return value is error (this comes from electron: TODO convert to real error) */
  openPath(path: string): Promise<string>
  getConfigPath(): string // TODO: rename -> this is for app data directory, it should include the scheme - seems to be only used for bg path right now

  // webxdc
  openWebxdc(msgId: number, params: DcOpenWebxdcParameters): void
  getWebxdcIconURL(accountId: number, msgId: number): string
  deleteWebxdcAccountData(accountId: number): Promise<void>
  closeAllWebxdcInstances(): void
  notifyWebxdcStatusUpdate(accountId: number, instanceId: number): void
  notifyWebxdcRealtimeData(
    accountId: number,
    instanceId: number,
    payload: number[]
  ): void
  notifyWebxdcMessageChanged(accountId: number, instanceId: number): void
  notifyWebxdcInstanceDeleted(accountId: number, instanceId: number): void

  /**
   * Initiates and conducts the video call fully, from start to end.
   */
  startOutgoingVideoCall(accountId: number, chatId: number): void

  // control app
  restartApp(): void

  // translations
  getLocaleData(locale?: string): Promise<LocaleData>
  setLocale(locale: string): Promise<void>

  // more system integration functions:
  setBadgeCounter(value: number): void
  showNotification(data: DcNotification): void
  clearAllNotifications(): void
  clearNotifications(accountId: number, chatId: number): void
  /** enables to set a callback (used in frontend RuntimeAdapter) */
  setNotificationCallback(
    cb: (data: { accountId: number; chatId: number; msgId: number }) => void
  ): void
  writeTempFileFromBase64(name: string, content: string): Promise<string>
  writeTempFile(name: string, content: string): Promise<string>
  /** make sure to sanitize filename to avoid stuff like ../../ */
  copyFileToInternalTmpDir(
    fileName: string,
    sourcePath: string
  ): Promise<string>
  removeTempFile(path: string): Promise<void>
  getAvailableThemes(): Promise<Theme[]>
  getActiveTheme(): Promise<{
    theme: Theme
    data: string
  } | null>
  saveBackgroundImage(file: string, isDefaultPicture: boolean): Promise<string>

  /** only support this if you have a real implementation for `isDroppedFileFromOutside`  */
  onDragFileOut(file: string): void
  /** Set drag listener to handle drag and drop events */
  setDropListener(onDrop: DropListener | null): void
  /** guard function that checks if it is a file from `onDragFileOut`, if so it denies the drop.
   * It checks by checking if file path contains references to the deltachat bob dir,
   */
  isDroppedFileFromOutside(file: string): boolean

  getAutostartState(): Promise<AutostartState>
  // callbacks to set
  onChooseLanguage: ((locale: string) => Promise<void>) | undefined
  /** backend notifies ui to reload theme,
   * either because system theme changed or the theme changed that was watched by --theme-watch  */
  onThemeUpdate: (() => void) | undefined
  onShowDialog:
    | ((kind: 'about' | 'keybindings' | 'settings') => void)
    | undefined
  onOpenQrUrl: ((url: string) => void) | undefined
  onWebxdcSendToChat:
    | ((
        file: { file_name: string; file_content: string } | null,
        text: string | null,
        account?: number
      ) => void)
    | undefined
  onResumeFromSleep: (() => void) | undefined
  onToggleNotifications: (() => void) | undefined

  checkMediaAccess: (mediaType: MediaType) => Promise<MediaAccessStatus>

  // undefined if the platform does not support askForMediaAccess
  askForMediaAccess: (mediaType: MediaType) => Promise<boolean | undefined>
}

export const runtime: Runtime = (window as any).r

// delete runtime reference on window (`window.r`) so it can only be used by importing this file.
// if you need to use it to debug stuff use the reference on `window.exp.runtime` instead, which is only available in --devmode
delete (window as any).r

// copied the ones from electron
// commented out the ones that we don't use, to make it simpler to implement for other targets/runtimes
export type RuntimeAppPath =
  | 'home'
  // | 'appData'
  // | 'userData'
  // | 'sessionData'
  // | 'temp'
  // | 'exe'
  // | 'module'
  | 'desktop'
  | 'documents'
  | 'downloads'
  // | 'music'
  | 'pictures'
// | 'videos'
// | 'recent' - exists in electron, but not yet in tauri - anyways we don't use it yet
// | 'logs'
// | 'crashDumps'
