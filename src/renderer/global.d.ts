import { getMessageFunction, LocaleData } from '../shared/localize'
import { DesktopSettingsType } from '../shared/shared-types'

import {
  OpenDialogFunctionType,
  CloseDialogFunctionType,
} from './components/dialogs/DialogController'
import { userFeedback, Screens } from './ScreenController'
import { View as MainScreenView } from './components/screens/MainScreen'

declare global {
  interface Window {
    localeData: LocaleData
    /** not auto updated translate, for a translate function that responds to language updates use i18nContext */
    static_translate: getMessageFunction
    exp: todo
    electron_functions: {
      // see static/preload.js,
      // but when importing other things, please do it in runtime.ts
      // we will move the ipcRenderer there too eventually
      ipcRenderer: import('electron').IpcRenderer
    }
    __openDialog: OpenDialogFunctionType
    __userFeedback: (message: userFeedback | false) => void
    __closeDialog: CloseDialogFunctionType
    __changeScreen: (screen: Screens) => void
    __selectAccount: (accountId: number) => void
    __screen: Screens
    __contextMenuActive: boolean
    __settingsOpened: boolean
    __keybindingsDialogOpened: boolean
    __setQuoteInDraft: ((msgId: number) => void) | null
    __reloadDraft: (() => void) | null
    __chatlistSetSearch: ((searchTerm: string) => void) | undefined
    __chatStore: any
    __setMainScreenView:
      | React.Dispatch<React.SetStateAction<MainScreenView>>
      | undefined
  }
}
