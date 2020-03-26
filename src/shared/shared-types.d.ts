type PromiseType<T> = T extends Promise<infer U> ? U : any

export interface Login {
  addr: string
  path: string
}

export interface Credentials {
  addr: string
}

export interface LocalSettings {
  bounds: {
    height: number
    width: number
    x: number
    y: number
  }
  chatViewBgImg: string
  credentials: Credentials
  enableOnDemandLocationStreaming: boolean
  enterKeySends: boolean
  locale: string
  notifications: boolean
  showNotificationContent: boolean
  lastChats: { [account_addr: string]: number }
  zoomFactor: number
}

export interface AppState {
  deltachat: {
    configuring: boolean
    credentials: Credentials
    ready: boolean
  }
  logins: Array<Login>
  saved: LocalSettings
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

import { Contact } from 'deltachat-node'

export type ContactJSON = ReturnType<typeof Contact.prototype.toJson>
export interface ChatListItemType {
  id: number
  name: string
  avatarPath: string
  color: string
  lastUpdated: number
  summary: {
    text1: any
    text2: any
    status: string
  }
  deaddrop: any
  isVerified: boolean
  isGroup: boolean
  freshMessageCounter: number
  isArchiveLink: boolean
  contactIds: number[]
  isSelfTalk: boolean
  isDeviceTalk: boolean
  selfInGroup: boolean
}

import { Chat } from 'deltachat-node'

export type JsonChat = ReturnType<typeof Chat.prototype.toJson>

export type JsonContact = ReturnType<typeof Contact.prototype.toJson>
