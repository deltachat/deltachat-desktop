import { getMessageFunction, LocaleData } from '../shared/localize'
import { userFeedback, Screens } from './ScreenController'

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
    __userFeedback: (message: userFeedback | false) => void
    __changeScreen: (screen: Screens) => void
    __selectAccount: (accountId: number) => Promise<void>
    readonly __selectedAccountId: number | undefined
    __screen: Screens
    readonly __contextMenuActive: boolean
    __setContextMenuActive: (newVal: boolean) => void
    __settingsOpened: boolean
    __keybindingsDialogOpened: boolean
    __aboutDialogOpened: boolean
    __setQuoteInDraft: ((msgId: number) => void) | null
    __reloadDraft: (() => void) | null
    __chatlistSetSearch:
      | ((searchTerm: string, chatId: number | null) => void)
      | undefined
    __refetchChatlist: undefined | (() => void)
    __askForName: boolean
    __internal_jump_to_message:
      | undefined
      | ((
          msgId: number | undefined,
          highlight?: boolean,
          addMessageIdToStack?: undefined | number
        ) => Promise<void>)
    __updateAccountListSidebar: (() => void) | undefined
  }
}
