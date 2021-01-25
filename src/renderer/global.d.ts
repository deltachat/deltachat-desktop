import { getMessageFunction, LocaleData } from '../shared/localize'

import Electron from 'electron'
import {
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
      openExternal: typeof Electron.shell.openExternal
      openPath: typeof Electron.shell.openPath
      app_getPath: typeof Electron.app.getPath
      write_clipboard_text: typeof Electron.clipboard.writeText
      read_clipboard_text: typeof Electron.clipboard.readText
    }
    __openDialog: OpenDialogFunctionType
    __userFeedback: (message: userFeedback | false) => {}
    __closeDialog: CloseDialogFunctionType
    __changeScreen: (screen: Screens) => {}
    __loadAccount: (account: DeltaChatAccount) => {}
    __screen: Screens
    __contextMenuActive: boolean
    __settingsOpened: boolean
    __setQuoteInDraft: ((msgId: number) => void) | null
  }
}
