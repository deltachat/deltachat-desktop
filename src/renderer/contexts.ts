import React, { useState } from 'react'
import { DesktopSettings } from '../shared/shared-types'
import { getDefaultState } from '../shared/state'
import ScreenController, { userFeedback, Screens } from './ScreenController'
import { DialogId } from './components/dialogs/DialogController'
import { any } from 'prop-types'
import { DeltaBackend } from './delta-remote'

const noop: Function = () => {}

export const ScreenContext = React.createContext({
  openDialog: (fnc: any, props?: any) => {},
  closeDialog: (name: string) => {},
  userFeedback: (message: false | userFeedback) => {},
  changeScreen: (screen: Screens) => {},
  screen: null,
})

export const SettingsContext: React.Context<{
  desktopSettings: DesktopSettings,
  setDesktopSetting: (key: keyof DesktopSettings, value: string | number | boolean) => {}
}> = React.createContext({
  desktopSettings: null,
  setDesktopSetting: null,
})

export type unwrapContext<T> = T extends import('react').Context<infer R>
  ? R
  : null
