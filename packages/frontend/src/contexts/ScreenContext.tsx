import { createContext } from 'react'

import type { Screens, userFeedback } from '../ScreenController'

export const ScreenContext = createContext({
  userFeedback: (_message: false | userFeedback) => {},
  changeScreen: (_screen: Screens) => {},
  screen: null as Screens | null,
  smallScreenMode: false as boolean,
})
