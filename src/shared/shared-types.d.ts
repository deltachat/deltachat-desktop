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

