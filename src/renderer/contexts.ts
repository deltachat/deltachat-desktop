import React, { useContext } from 'react'
import { DesktopSettings, DeltaChatAccount } from '../shared/shared-types'
import { userFeedback, Screens } from './ScreenController'
import { getMessageFunction } from '../shared/localize'
import { showFnType } from './components/ContextMenu'

export const ScreenContext = React.createContext({
  openDialog: (_fnc: any, _props?: any) => {},
  openContextMenu: (..._args: Parameters<showFnType>) => {},
  closeDialog: (_id: number) => {},
  userFeedback: (_message: false | userFeedback) => {},
  changeScreen: (_screen: Screens) => {},
  screen: null,
})

export const i18nContext = React.createContext<getMessageFunction>(
  key => key as any
)

/** convinence wrapper function for `useContext(i18nContext)`
 *
 * This is a react hook, make sure you only use it where you can use reactHooks,
 * as example in functional components.
 *
 * Otherwise use the `<i18nContext.Consumer>` or when you don't need
 * the dynamic updating functionality use `window.static_translate` directly.
 */
export const useTranslationFunction = () => useContext(i18nContext)

export const SettingsContext: React.Context<{
  desktopSettings: DesktopSettings
  setDesktopSetting: (
    key: keyof DesktopSettings,
    value: string | number | boolean
  ) => {}
  account: DeltaChatAccount
}> = React.createContext({
  desktopSettings: null,
  setDesktopSetting: null,
  account: null,
})

export type unwrapContext<T> = T extends import('react').Context<infer R>
  ? R
  : null
