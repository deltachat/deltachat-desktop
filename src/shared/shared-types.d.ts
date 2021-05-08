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
}

export interface DesktopSettings {
  bounds:
    | {
        height: number
        width: number
        x: number
        y: number
      }
    | {}
  chatViewBgImg: string
  /** @deprecated replaced by lastAccount */
  credentials: Credentials
  /** path to last used/selected Account */
  lastAccount: string
  enableAVCalls: boolean
  enableOnDemandLocationStreaming: boolean
  enterKeySends: boolean
  locale: string | null
  notifications: boolean
  showNotificationContent: boolean
  lastChats: { [account_addr: string]: number }
  zoomFactor: number
  /** address to the active theme file scheme: "custom:name" or "dc:name" */
  activeTheme: string
  minimizeToTray: boolean
}

export interface AppState {
  saved: DesktopSettings
  logins: DeltaChatAccount[]
}

export interface RC_Config {
  'log-debug': boolean
  'log-to-console': boolean
  'machine-readable-stacktrace': boolean
  'multiple-instances': boolean
  theme: string | undefined
  'theme-watch': boolean
  debug: boolean
  'translation-watch': boolean
}

import { App } from 'electron'
import { LocaleData } from '../shared/localize'
import { QrState } from '../shared/constants'

export interface ExtendedApp extends App {
  rc: RC_Config
  isQuitting: boolean
  ipcReady: boolean
  localeData?: LocaleData
  state?: AppState
}

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
  deaddrop: any
  isProtected: boolean
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

export type JsonMessage = ReturnType<typeof Message.prototype.toJson>

export interface FullChat {
  id: number
  name: string
  isProtected: boolean
  profileImage: string
  archived: boolean
  subtitle: any
  type: number
  isUnpromoted: boolean
  isSelfTalk: boolean
  contacts: JsonContact[]
  contactIds: number[]
  color: string
  freshMessageCounter: number
  isGroup: boolean
  isDeaddrop: boolean
  isDeviceChat: boolean
  selfInGroup: boolean
  muted: boolean
  ephemeralTimer: number
}

type todo = any

export interface MessageTypeAttachment {
  url: string
  contentType: string
  fileName: string
  fileSize: string
}

export type msgStatus =
  | 'error'
  | 'sending'
  | 'draft'
  | 'delivered'
  | 'read'
  | 'sent'
  | ''

export interface MessageType {
  id: number
  msg: JsonMessage & {
    sentAt: number
    receivedAt: number
    direction: 'outgoing' | 'incoming'
    status: msgStatus
    attachment?: MessageTypeAttachment
  }
  filemime: string
  filename: string
  filesize: todo
  viewType: todo
  fromId: number
  isMe: boolean
  contact: DCContact
  isInfo: boolean
  setupCodeBegin?: string
}

export type DCContact = JsonContact

export type Theme = {
  name: string
  description: string
  address: string
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

export type DeltaChatAccount = {
  path: string
  displayname: string
  addr: string
  size: number
  profileImage: string
  color: string
}

export declare type QrCodeResponse = {
  state: QrState
  id: number
  text1: string
}
