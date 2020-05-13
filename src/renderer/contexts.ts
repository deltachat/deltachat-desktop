import React from 'react'
import { LocalSettings } from '../shared/shared-types'
import { getDefaultState } from '../shared/state'
import { userFeedback } from './ScreenController'
import { DialogId } from './components/dialogs'

const noop: Function = () => {}

export const ScreenContext = React.createContext({
  openDialog: (fnc: any, props?: any) => {},
  closeDialog: (name: string) => {},
  userFeedback: (message: false | userFeedback) => {},
  changeScreen: noop,
})

export const SettingsContext: React.Context<LocalSettings> = React.createContext(
  getDefaultState().saved
)

export type unwrapContext<T> = T extends import('react').Context<infer R>
  ? R
  : null
