export interface Login {
  addr: string;
  path: string;
}

export interface Credentials {
  addr: string;
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

export interface AppState {
  deltachat: {
    configuring: boolean;
    credentials: Credentials;
    ready: boolean;
  };
  logins: Array<Login>;
  saved: LocalSettings;
}

export interface RC_Config {
  'log-debug': boolean
  'log-to-console': boolean
  'machine-readable-stacktrace': boolean
}

import { App } from 'electron'
import { LocaleData } from '../shared/localize'

export interface ExtendedApp extends App {
  rc: RC_Config;
  isQuitting: boolean;
  ipcReady: boolean;
  localeData?: LocaleData;
  state?: AppState;
}
