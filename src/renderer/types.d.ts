export interface Credentials {
  addr: string;
  passwd?: string;
}

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


export interface AppState {
  deltachat: {
    configuring: boolean;
    credentials: Credentials;
    ready: boolean;
  }
  saved: LocalSettings;
  logins: Array<string>;
}