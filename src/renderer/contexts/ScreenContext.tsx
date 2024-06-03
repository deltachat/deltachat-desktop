import { createContext } from 'react'

import type { Screens, userFeedback } from '../ScreenController'

export const ScreenContext = createContext({
  userFeedback: (_message: false | userFeedback) => {},
  changeScreen: (_screen: Screens) => {},
  screen: null as Screens | null,
  addAndSelectAccount: (() =>
    Promise.reject('screen context not defined')) as () => Promise<number>,
  smallScreenMode: false as boolean,
})
