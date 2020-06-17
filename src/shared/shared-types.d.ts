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

export interface LocalSettings {
  bounds:
    | {
        height: number
        width: number
        x: number
        y: number
      }
    | {}
  chatViewBgImg: string
  credentials: Credentials
  enableOnDemandLocationStreaming: boolean
  enterKeySends: boolean
  locale: string
  notifications: boolean
  showNotificationContent: boolean
  lastChats: { [account_addr: string]: number }
  zoomFactor: number
  /** adress to the active theme file scheme: "custom:name" or "dc:name" */
  activeTheme: string
}

export interface AppState {
  deltachat: {
    credentials: Credentials
  }
  saved: {
    bounds: todo
    credentials: any
    enterKeySends: boolean
    notifications: boolean
    showNotificationContent: boolean
    locale: string
    enableOnDemandLocationStreaming: boolean
    chatViewBgImg: string
    lastChats: todo
    zoomFactor: number
    activeTheme: string
  }
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

export interface ExtendedApp extends App {
  rc: RC_Config
  isQuitting: boolean
  ipcReady: boolean
  localeData?: LocaleData
  state?: AppState
}

import DeltaChat, { Contact } from 'deltachat-node'

export type ContactJSON = ReturnType<typeof Contact.prototype.toJson>
export interface ChatListItemType {
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
  isVerified: boolean
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

import { Chat, Message } from 'deltachat-node'
import { type } from 'os'

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
  isVerified: boolean
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
  draft: string
  selfInGroup: boolean
  muted: boolean
}

type todo = any
export interface MessageType {
  id: number
  msg: JsonMessage & {
    sentAt: number
    receivedAt: number
    direction: 'outgoing' | 'incoming'
    status: todo
    attachment?: {
      url: string
      contentType: string
      fileName: string
      fileSize: string
    }
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

export type DCContact = Omit<JsonContact, 'color'> & { color: string }

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
}
