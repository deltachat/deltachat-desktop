import React from 'react'
import { LocalSettings } from '../shared/shared-types'
import { getDefaultState } from '../shared/state'
import { userFeedback } from './ScreenController'

const noop: Function = () => {}

export const ScreenContext = React.createContext({
  openDialog: (name: string, props?: any) => {},
  closeDialog: (name: string) => {},
  userFeedback: (message: false | userFeedback) => {},
  changeScreen: noop,
})

export const SettingsContext: React.Context<LocalSettings> = React.createContext(
  getDefaultState().saved
)
