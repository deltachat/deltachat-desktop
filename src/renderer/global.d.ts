import { getMessageFunction, LocaleData } from '../shared/localize'

import Electron from 'electron'
import {
  DialogId,
  OpenDialogFunctionType,
  CloseDialogFunctionType,
} from './components/dialogs/DialogController'
import { userFeedback, Screens } from './ScreenController'
import { DeltaChatAccount } from '../shared/shared-types'

declare global {
  interface Window {
    localeData: LocaleData
    /** not auto updated translate, for a translate function that responds to language updates use i18nContext */
    static_translate: getMessageFunction
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
    __changeScreen: (screen: Screens) => {}
    __loadAccount: (account: DeltaChatAccount) => {}
    __screen: Screens
    __contextMenuActive: boolean
  }
}
