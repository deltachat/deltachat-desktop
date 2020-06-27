import React, { useState, useContext } from 'react'
import { DesktopSettings, Credentials } from '../shared/shared-types'
import { getDefaultState } from '../shared/state'
import ScreenController, { userFeedback, Screens } from './ScreenController'
import { DialogId } from './components/dialogs/DialogController'
import { any } from 'prop-types'
import { DeltaBackend } from './delta-remote'
import { getMessageFunction } from '../shared/localize'

const noop: Function = () => {}

export const ScreenContext = React.createContext({
  openDialog: (fnc: any, props?: any) => {},
  closeDialog: (name: string) => {},
  userFeedback: (message: false | userFeedback) => {},
  changeScreen: (screen: Screens) => {},
  screen: null,
})

export const i18nContext = React.createContext<getMessageFunction>(
  key => key as any
)
export const useTranslationFunction = () => useContext(i18nContext)

export const SettingsContext: React.Context<{
  desktopSettings: DesktopSettings
  setDesktopSetting: (
    key: keyof DesktopSettings,
    value: string | number | boolean
  ) => {}
  credentials: Credentials
}> = React.createContext({
  desktopSettings: null,
  setDesktopSetting: null,
  credentials: null,
})

export type unwrapContext<T> = T extends import('react').Context<infer R>
  ? R
  : null
