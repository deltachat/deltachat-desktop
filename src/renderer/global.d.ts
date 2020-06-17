import { getMessageFunction, LocaleData } from '../shared/localize'

import Electron from 'electron'
import {
  DialogId,
  OpenDialogFunctionType,
  CloseDialogFunctionType,
} from './components/dialogs/DialogController'
import { userFeedback, Screens } from './ScreenController'

declare global {
  interface Window {
    translate: getMessageFunction
    localeData: LocaleData
    exp: todo
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
    __openDialog: OpenDialogFunctionType
    __userFeedback: (message: userFeedback | false) => {}
    __closeDialog: CloseDialogFunctionType
    __changeScreen: (screen: Screens) => void
    __isReady: boolean
  }
}
