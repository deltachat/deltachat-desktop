export type PromiseType<T> = T extends Promise<infer U> ? U : any

type Bounds = {
  height: number
  width: number
  x: number
  y: number
}

export interface DesktopSettingsType {
  bounds: Bounds | {}
  HTMLEmailWindowBounds: Bounds | undefined
  chatViewBgImg?: string
  /**
   * @deprecated replaced by lastAccount,
   * not used since ages, still here so we are reminded to delete it should it exist */
  credentials?: never
  /** path to last used/selected Account
   *
   * @deprecated in favor of storing selected account over core account manager in accounts.toml
   */
  lastAccount?: number
  /**
   * @deprecated removed in https://github.com/deltachat/deltachat-desktop/pull/3965
   * @see {@linkcode enableAVCallsV2}
   */
  enableAVCalls?: boolean
  /**
   * The new version of video calls.
   * @see https://github.com/orgs/deltachat/projects/81
   * @see also {@linkcode enableAVCalls}
   */
  enableAVCallsV2: boolean
  enableBroadcastLists: boolean
  enableOnDemandLocationStreaming: boolean
  enterKeySends: boolean
  locale: string | null
  notifications: boolean
  showNotificationContent: boolean
  isMentionsEnabled: boolean
  /**
   * Controls the volume of the sound accompanying incoming
   * (and possibly outgoing, in the future) messages
   * of the currently open chat.
   * A number between 0 and 1.
   *
   * This is important for accessibility. We do not otherwise announce
   * incoming messages in the current chat.
   */
  inChatSoundsVolume: number
  /** @deprecated isn't used anymore since the move to jsonrpc */
  lastChats: { [accountId: number]: number }
  /** @deprecated we don't store/read the zoomFactor from settings since PR #5175
   *  chromium saves it per same-origin
   */
  zoomFactor: number | undefined
  /** address to the active theme file scheme: "custom:name" or "dc:name" */
  activeTheme: string
  minimizeToTray: boolean
  syncAllAccounts: boolean
  /** @deprecated The last used file location for the save dialog is now only kept in memory and not persisted anymore between sessions. */
  lastSaveDialogLocation: string | undefined
  /** @deprecated */
  experimentalEnableMarkdownInMessages?: boolean
  enableWebxdcDevTools: boolean
  /** set to false to disable the confirmation dialog for loading remote content */
  HTMLEmailAskForRemoteLoadingConfirmation: boolean
  /** always loads remote content without asking, for non contact requests  */
  HTMLEmailAlwaysLoadRemoteContent: boolean
  /** gallery image & video - keep aspect ratio (true) or cover (false) */
  galleryImageKeepAspectRatio: boolean
  /** whether to use system ui font */
  useSystemUIFont: boolean
  /**
   * Tell the operating system to prevent screen recoding and screenshots for delta chat
   * also called screen_security
   */
  contentProtectionEnabled: boolean
  /** whether to start with system on supported platforms */
  autostart: boolean
}

export interface RC_Config {
  'log-debug': boolean
  'log-to-console': boolean
  'machine-readable-stacktrace': boolean
  theme: string | undefined
  'theme-watch': boolean
  devmode: boolean
  'translation-watch': boolean
  minimized: boolean
  version: boolean
  v: boolean
  help: boolean
  h: boolean
  'allow-unsafe-core-replacement': boolean
}

import type { T } from '@deltachat/jsonrpc-client'
import { NOTIFICATION_TYPE } from './constants.ts'

export type Theme = {
  name: string
  description: string
  address: string
  /** whether the theme is a prototype and should be hidden in the selection unless deltachat is started in devmode */
  is_prototype: boolean
}

/** Additional info about the runtime the ui might need */
export type RuntimeInfo = {
  /** used to determine wether to use borderless design and to use command key in shortcuts or not */
  isMac: boolean
  /** currently used to check for an additional device message */
  isAppx: boolean
  /** to show / hide elements/options that are not supported, like tray icon options on browser */
  target: 'electron' | 'browser' | 'tauri'
  /** runtime library versions, be it electron, node, tauri or whatever,
   *  used for showing to user in the About dialog */
  versions: { label: string; value: string }[]
  runningUnderARM64Translation?: boolean
  rpcServerPath?: string
  buildInfo: BuildInfo
  isContentProtectionSupported: boolean
  /** whether to hide emoji & sticker picker -> this is the case for mobile ios/android because they have their own sticker picker
   * and sticker picker currently would open a folder, which is inside of the pp container, so too much work to make work for now
   */
  hideEmojiAndStickerPicker?: boolean
  tauriSpecific?: {
    scheme: {
      blobs: string
      chatBackgroundImage: string
      webxdcIcon: string
      stickers: string
    }
  }
}

export interface BuildInfo {
  VERSION: string
  GIT_REF: string
  BUILD_TIMESTAMP: number
}

export interface DcNotification {
  title: string
  body: string
  /**
   * path to image that should be shown instead of icon
   * (or a data url with base64 encoded data)
   */
  icon: string | null
  iconIsAvatar?: boolean // for tauri, windows controlling how images is disaplayed
  chatId: number
  messageId: number
  accountId: number
  notificationType: NOTIFICATION_TYPE
}

export interface DcOpenWebxdcParameters {
  accountId: number
  displayname: string | null
  webxdcInfo: T.WebxdcMessageInfo
  chatName: string
  href: string
}

export interface RuntimeOpenDialogOptions {
  title?: string
  filters?: {
    name: string
    extensions: string[]
  }[]
  properties: (
    | 'openFile'
    | 'openDirectory'
    | 'createDirectory'
    | 'multiSelections'
  )[]
  defaultPath?: string
  buttonLabel?: string
}

export interface AutostartState {
  isSupported: boolean
  // This is not the same as enabled in the desktop settings,
  // this is the actual state not the desktop setting
  // null means it can't be determined and no message should be shown
  isRegistered: boolean | null
}
