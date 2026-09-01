import { createContext } from 'react'

import type { Screens } from '../ScreenController'

export const ScreenContext = createContext({
  changeScreen: (_screen: Screens) => {},
  screen: null as Screens | null,
  smallScreenMode: false as boolean,
})
