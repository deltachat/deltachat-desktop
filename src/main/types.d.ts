import { App } from 'electron'

import { RC_Config } from './rc'

import { LocaleData } from '../shared/localize'

import { AppState } from '../shared/shared-types'

export interface ExtendedApp extends App{
  rc: RC_Config;
  isQuitting: boolean;
  ipcReady: boolean;
  localeData?: LocaleData;
  state?: AppState;
  saveState?: (arg: AppState) => void;
  // saveState is likely not shared to renderer so the type ExtendedApp can not be shared with renderer
}