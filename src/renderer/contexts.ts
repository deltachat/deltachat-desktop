import React, { useState, useContext } from 'react'
import { DesktopSettings, DeltaChatAccount } from '../shared/shared-types'
import { getDefaultState } from '../shared/state'
import ScreenController, { userFeedback, Screens } from './ScreenController'
import { DialogId } from './components/dialogs/DialogController'
import { any } from 'prop-types'
import { DeltaBackend } from './delta-remote'
import { getMessageFunction } from '../shared/localize'
import { showFnType } from './components/ContextMenu'

const noop: Function = () => {}

export const ScreenContext = React.createContext({
  openDialog: (fnc: any, props?: any) => {},
  openContextMenu: (...args: Parameters<showFnType>) => {},
  closeDialog: (name: string) => {},
  userFeedback: (message: false | userFeedback) => {},
  changeScreen: (screen: Screens) => {},
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
