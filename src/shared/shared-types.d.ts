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

export interface DesktopSettingsType {
  bounds:
    | {
        height: number
        width: number
        x: number
        y: number
      }
    | {}
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
import type { Contact } from 'deltachat-node'

export type ContactJSON = ReturnType<typeof Contact.prototype.toJson>

import type { Chat, Message } from 'deltachat-node'

export type JsonChat = ReturnType<typeof Chat.prototype.toJson>

export type JsonContact = ReturnType<typeof Contact.prototype.toJson>

export type JsonMessage = ReturnType<typeof Message.prototype.toJson> & {
  quote: MessageQuote | null
}

export type MessageQuote = {
  text: string
  message: {
    messageId: number
    displayName: string
    displayColor: string
    overrideSenderName: string
    image: null | string
    isForwarded: boolean
  } | null
}

export interface FullChat {
  id: number
  name: string
  canSend: boolean
  isProtected: boolean
  profileImage: string
  archived: boolean
  type: number
  isUnpromoted: boolean
  isSelfTalk: boolean
  contacts: JsonContact[]
  contactIds: number[]
  color: string
  freshMessageCounter: number
  isBroadcast: boolean
  isGroup: boolean
  isContactRequest: boolean
  isDeviceChat: boolean
  selfInGroup: boolean
  muted: boolean
  ephemeralTimer: number
}

type todo = any

export type msgStatus =
  | 'error'
  | 'sending'
  | 'draft'
  | 'delivered'
  | 'read'
  | 'sent'
  | ''

export type MessageType = JsonMessage & {
  sender: JsonContact
  setupCodeBegin?: string
  file_mime: string | null
  file_bytes: number | null
  file_name: string | null
}

export type Theme = {
  name: string
  description: string
  address: string
  /** whether the theme is a prototype and should be hidden in the selection unless deltachat is started in devmode */
  is_prototype: boolean
}

export type DeltaChatAccount =
  | { id: number; type: 'unconfigured' }
  | {
      id: number
      type: 'configured'
      display_name: string | null
      addr: string | null
      profile_image: string | null
      color: string
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
