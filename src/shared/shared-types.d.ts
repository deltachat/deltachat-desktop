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
  lastChats: { [accountId: number]: number }
  zoomFactor: number
  /** address to the active theme file scheme: "custom:name" or "dc:name" */
  activeTheme: string
  minimizeToTray: boolean
  syncAllAccounts: boolean
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

import { QrState } from '../shared/constants'

import type { Contact } from 'deltachat-node'

export type ContactJSON = ReturnType<typeof Contact.prototype.toJson>
export interface ChatListItemType {
  /** chat id */
  id: number
  name: string
  avatarPath: string
  color: string
  lastUpdated: number
  summary:
    | {
        text1: any
        text2: any
        status: string
      }
    | undefined
  isContactRequest: boolean
  isProtected: boolean
  isBroadcast: boolean
  isGroup: boolean
  freshMessageCounter: number
  isArchiveLink: boolean
  contactIds: number[]
  isSelfTalk: boolean
  isDeviceTalk: boolean
  selfInGroup: boolean
  archived: boolean
  pinned: boolean
  muted: boolean
}

import type { Chat, Message } from 'deltachat-node'

export type JsonChat = ReturnType<typeof Chat.prototype.toJson>

export type JsonContact = ReturnType<typeof Contact.prototype.toJson>

export type JsonLocations = {
  accuracy: number
  latitude: number
  longitude: number
  timestamp: number
  contactId: number
  msgId: number
  chatId: number
  isIndependent: boolean
  marker: string
}[] // ReturnType<typeof DeltaChat.prototype.getLocations>

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

export type MessageTypeAttachmentSubset = Pick<
  MessageType,
  'file' | 'file_mime' | 'file_bytes' | 'file_name'
>

export type Theme = {
  name: string
  description: string
  address: string
  /** whether the theme is a prototype and should be hidden in the selection unless deltachat is started in devmode */
  is_prototype: boolean
}

export type MessageSearchResult = {
  id: number
  authorProfileImage: string
  author_name: string
  author_color: string
  chat_name: null | string
  message: string
  timestamp: number
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

export declare type QrCodeResponse = {
  state: QrState
  id: number
  text1: string
}

/** Additional info about the runtime the ui might need */
export type RuntimeInfo = {
  /** used to determine wether to use command key in shortcuts or not */
  isMac: boolean
}
