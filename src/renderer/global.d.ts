import { getMessageFunction, LocaleData } from '../shared/localize'

import Electron from 'electron'
import { ThemeManager } from './ThemeManager'

declare global {
  interface Window {
    translate: getMessageFunction
    localeData: LocaleData
    ThemeManager: ThemeManager
    electron_functions: {
      // see static/preload.js
      ipcRenderer: import('electron').IpcRenderer
      remote: import('electron').Remote
      openExternal: typeof Electron.shell.openExternal
      openItem: typeof Electron.shell.openItem
    }
    preload_functions: {
      downloadFile: (file: string) => void
    }
  }
}
