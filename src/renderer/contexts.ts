import React, { useContext } from 'react'
import { userFeedback, Screens } from './ScreenController'
import { getMessageFunction } from '../shared/localize'
import { showFnType } from './components/ContextMenu'
import { OpenDialogFunctionType } from './components/dialogs/DialogController'

export const ScreenContext = React.createContext({
  openDialog: ((_fnc: any, _props?: any) => {}) as OpenDialogFunctionType,
  openContextMenu: (..._args: Parameters<showFnType>) => {},
  closeDialog: (_id: number) => {},
  userFeedback: (_message: false | userFeedback) => {},
  changeScreen: (_screen: Screens) => {},
  screen: null as Screens | null,
})

export const i18nContext = React.createContext<getMessageFunction>(
  key => key as any
)

/** convenience wrapper function for `useContext(i18nContext)`
 *
 * This is a react hook, make sure you only use it where you can use reactHooks,
 * as example in functional components.
 *
 * Otherwise use the `<i18nContext.Consumer>` or when you don't need
 * the dynamic updating functionality use `window.static_translate` directly.
 */
export const useTranslationFunction = () => useContext(i18nContext)

export type unwrapContext<T> = T extends import('react').Context<infer R>
  ? R
  : null

type MessagesDisplayContextType =
  | { context: 'chat_messagelist'; chatId: number }
  | { context: 'chat_map'; chatId: number }
  | {
      context: 'contact_profile_status'
      contact_id: number
      closeProfileDialog: () => void
    }
  | null
/** Additional context for message body rendering
 * this context is currently only used by bot command suggestions
 * that they know in which chat they need to set/replace the draft */
export const MessagesDisplayContext = React.createContext(
  null as MessagesDisplayContextType
)
