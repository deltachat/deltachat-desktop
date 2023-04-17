type PromiseType<T> = T extends Promise<infer U> ? U : any

export type Credentials = {
  [key: string]: any
  addr?: string
  mail_user?: string
  mail_pw?: string
  mail_server?: string
  mail_port?: string
  mail_security?: 'automatic' | '' | 'ssl' | 'default'
  imap_certificate_checks?: any
  send_user?: string
  send_pw?: string
  send_server?: string
  send_port?: string
  send_security?: 'automatic' | '' | 'ssl' | 'starttls' | 'plain'
  smtp_certificate_checks?: any
  socks5_enabled: string
  socks5_host: string
  socks5_port: string
  socks5_user: string
  socks5_password: string
}

export type sendMessageParams = {
  text?: string | null
  filename?: string
  location?: {
    lat: number
    lng: number
  }
  quoteMessageId?: number
}

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
  /** @deprecated replaced by lastAccount */
  credentials?: Credentials
  /** path to last used/selected Account */
  lastAccount?: number
  enableAVCalls: boolean
  enableBroadcastLists: boolean
  enableChatAuditLog: boolean
  enableOnDemandLocationStreaming: boolean
  enterKeySends: boolean
  locale: string | null
  notifications: boolean
  showNotificationContent: boolean
  /** @deprecated isn't used anymore since the move to jsonrpc */
  lastChats: { [accountId: number]: number }
  zoomFactor: number
  /** address to the active theme file scheme: "custom:name" or "dc:name" */
  activeTheme: string
  minimizeToTray: boolean
  syncAllAccounts: boolean
  lastSaveDialogLocation: string | undefined
  experimentalEnableMarkdownInMessages: boolean
  enableWebxdcDevTools: boolean
  /** set to false to disable the confirmation dialog for loading remote content */
  HTMLEmailAskForRemoteLoadingConfirmation: boolean
  /** always loads remote content without asking, for non contact requests  */
  HTMLEmailAlwaysLoadRemoteContent: boolean
}

export interface RC_Config {
  'log-debug': boolean
  'log-to-console': boolean
  'machine-readable-stacktrace': boolean
  'multiple-instances': boolean
  theme: string | undefined
  'theme-watch': boolean
  devmode: boolean
  'translation-watch': boolean
  minimized: boolean
  version: boolean
  v: boolean
  help: boolean
  h: boolean
}

import { T } from '@deltachat/jsonrpc-client'

export type msgStatus =
  | 'error'
  | 'sending'
  | 'draft'
  | 'delivered'
  | 'read'
  | 'sent'
  | ''

export type Theme = {
  name: string
  description: string
  address: string
  /** whether the theme is a prototype and should be hidden in the selection unless deltachat is started in devmode */
  is_prototype: boolean
}

// Types that will stay:

/** Additional info about the runtime the ui might need */
export type RuntimeInfo = {
  /** used to determine wether to use command key in shortcuts or not */
  isMac: boolean
}

export interface DcNotification {
  title: string
  body: string
  /** path to image that should be shown instead of icon */
  icon: string | null
  chatId: number
  messageId: number
  // for future
  accountId: number
}

export interface DcOpenWebxdcParameters {
  accountId: number
  displayname: string | null
  addr: string | null
  webxdcInfo: T.WebxdcMessageInfo
  chatName: string
}
