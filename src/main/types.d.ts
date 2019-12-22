import { App } from 'electron'

export interface Login {
  addr: string;
}

export interface AppState {
  deltachat: any;
  logins: Array<Login>;
  saved: boolean;
}

export interface ExtendedApp extends App{
  rc: any;
  isQuitting: boolean;
  ipcReady: boolean;
  localeData?: any
  state?: any;
  saveState?: (arg: AppState) => void;
}