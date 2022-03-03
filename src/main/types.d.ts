import { App } from 'electron'
import { DesktopSettingsType, RC_Config } from '../shared/shared-types'

export interface ExtendedAppMainProcess extends ExtendedApp {
  saveState?: (arg?: { saved: DesktopSettingsType }) => void
  // saveState is likely not shared to renderer so the type ExtendedApp can not be shared with renderer
  // once: (event: 'ipcReady', listener: () => void) => this // how can we overload this function without overwriting it?
}

export interface ExtendedApp extends App {
  rc: RC_Config
  isQuitting: boolean
  ipcReady: boolean
}
