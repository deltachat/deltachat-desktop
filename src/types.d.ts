import { App } from 'electron'
import { LngLat } from 'mapbox-gl'
import * as DC from 'deltachat-node'

export interface Login {
  addr: string;
}

export interface AppState {
  logins: Array<Login>;
  deltachat: {
    configuring: boolean;
    credentials: Credentials;
    ready: boolean;
  }
  saved: LocalSettings;
}

export interface ExtendedApp extends App{
  rc: any;
  isQuitting: boolean;
  ipcReady: boolean;
  localeData?: any
  state?: any;
  saveState?: (arg: AppState) => void;
  translate?: (key: string, substitutions: Array<string>, opts: any) => string;
}

export interface Credentials {
  addr: string;
  passwd?: string;
}

export interface Message {
  getText(): string;
  getFromId(): number;
  chatId: number;
  duration: number;
  file: string;
  fromId: number;
  id: number;
  receivedTimestamp: number;
  sortTimestamp: number;
  text: string;
  timestamp:  number;
  hasLocation: boolean;
  viewType: number;
  state: string;
  hasDeviatingTimestamp: boolean;
  showPadlock: boolean;
  summary: string;
  isSetupmessage: boolean;
  isInfo: boolean;
  isForwarded: boolean;
  dimensions: {
    height: number;
    width: number;
  }
}

export interface Contact{
  getProfileImage(): string;
  address: string;
  color: string;
  displayName: string;
  firstName: string;
  id: number;
  name: string;
  profileImage: string;
  nameAndAddr: string;
  isBlocked: boolean;
  isVerified: boolean;
  toJson(): Contact;
}

export interface RawChat extends DC.Chat {}

export interface Chat extends DC.Chat {
  freshMessageCounter: number;
  contactIds: Array<number>;
  contacts: Array<Contact>;
  summary: {
    text1: string;
    text2: string;
    status: string;
  };
  isGroup: boolean;
  deaddrop: {
    id: number,
    contact: Contact
  };
  isDeaddrop:boolean;
  isDeviceChat?: boolean;
  draft: string;
  selfInGroup: boolean;
}

export interface ChatListItem {
  id: number;
  name: string;
  color: string;
  avatarPath: string;
  lastUpdated: number
  isArchiveLink: boolean;
  freshMessageCounter: number;
  contactIds: Array<number>;
  summary: {
    text1: string;
    text2: string;
    status: string;
  };
  isGroup: boolean;
  isDeaddrop: boolean;
  deaddrop: {
    id: number,
    contact: Contact
  };
  isDeviceChat?: boolean;
  selfInGroup: boolean;
  isSelfTalk: boolean;
  isVerified: boolean;
  isDeviceTalk?: boolean;
}

export interface ChatList extends DC.ChatList {}

export interface LocaleData {
  locale: string;
  messages: {
    [key: string]: {message: string}
  }
} 

export interface LocalSettings {
  bounds: {
    height: number;
    width: number;
    x: number;
    y: number;
  }
  chatViewBgImg: string;
  credentials: Credentials;
  enableOnDemandLocationStreaming: boolean;
  enterKeySends: boolean;
  locale: string;
  notifications: boolean;
  showNotificationContent: boolean;
}
