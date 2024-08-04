import { userFeedback, Screens } from './ScreenController'

import '@deltachat-desktop/shared/global.d.ts'

declare global {
  interface Window {
    exp: todo
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
