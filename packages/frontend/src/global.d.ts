import { userFeedback, Screens } from './ScreenController'

import '@deltachat-desktop/shared/global.d.ts'
import type { useMessageList } from './stores/messagelist'
import type { T } from '@deltachat/jsonrpc-client'

declare global {
  interface Window {
    exp: todo
    __userFeedback: (message: userFeedback | false) => void
    __changeScreen: (screen: Screens) => void
    __selectAccount: (accountId: number) => Promise<void>
    readonly __selectedAccountId: number | undefined
    __selectedChatId: number | undefined
    __screen: Screens
    readonly __contextMenuActive: boolean
    __setContextMenuActive: (newVal: boolean) => void
    __settingsOpened: boolean
    __keybindingsDialogOpened: boolean
    __aboutDialogOpened: boolean

    __setQuoteInDraft: ((messageOrMessageId: number | T.Message) => void) | null
    /**
     * Setting this will make `useDraft` set the draft to this state,
     * as soon as it renders with the specified `accountId` and `chatId`.
     *
     * @see {@linkcode __internal_jump_to_message_asap}
     */
    __setDraftRequest?: {
      accountId: number
      chatId: number
      file?: {
        path: string
        name?: string
        viewType: T.Viewtype
        deleteTempFileWhenDone: boolean
      }
      text?: string
    }
    /**
     * This should be called after assigning to {@linkcode __setDraftRequest}
     * so that we don't have to wait for `useDraft` to re-render.
     *
     * @see {@linkcode __internal_check_jump_to_message}
     */
    __checkSetDraftRequest?: () => void

    __enterEditMessageMode: ((messageToEdit: T.Message) => void) | null

    __chatlistSetSearch:
      | ((searchTerm: string, chatId: number | null) => void)
      | undefined
    __refetchChatlist: undefined | (() => void)
    /**
     * Setting this will make the MessageList component `jumpToMessage`
     * as soon as it renders with the chat for `accountId` and `chatId`,
     * or upon the `__internal_check_jump_to_message` call.
     * After jumping to message it will immediately reset
     * `__internal_jump_to_message_asap` to `undefined`.
     *
     * You should not access this property unless necessary,
     * e.g. it's useful if you need to switch account.
     * Prefer `jumpToMessage` from `useMessage()` instead.
     *
     * Ensuring that MessageList _will_ load the chat with the specified
     * `accountId` and `chatId` is the responsibility of whoever
     * accesses this property.
     *
     * @see {@linkcode __setDraftRequest}
     */
    __internal_jump_to_message_asap?: {
      accountId: number
      chatId: number
      jumpToMessageArgs: Parameters<
        ReturnType<typeof useMessageList>['store']['effect']['jumpToMessage']
      >
    }
    /**
     * Makes the MessageList component check the value of
     * {@link __internal_jump_to_message_asap},
     * and jump to the specified message,
     * as long as it is ready to do so, i.e. as long as it has loaded
     * the chat with `accountId` and `chatId` specified in
     * `__internal_jump_to_message_asap`.
     * See {@link __internal_jump_to_message_asap} for more details.
     *
     * This should be called after assigning
     * to `__internal_jump_to_message_asap`,
     * but not necessary if the MessageList component is guaranteed to
     * re-render soon, in which case it will
     * read `__internal_jump_to_message_asap` itself automatically.
     * Calling this when the MessageList has not loaded the specified chat
     * will do nothing.
     *
     * This property is managed by the MessageList component instance,
     * it gets assigned when the component gets rendered.
     * @see {@linkcode __checkSetDraftRequest}
     */
    __internal_check_jump_to_message?: () => void
    /**
     * This is used by MessageList to see if another, newer instance
     * of a MessageList exists.
     */
    __internal_current_message_list_instance_id?: symbol
    __updateAccountListSidebar: (() => void) | undefined
    __closeAllDialogs: () => void | undefined
  }
}
