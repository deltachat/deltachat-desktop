import { createContext } from 'react'

import type { OpenContextMenu } from '../components/ContextMenu'
import type { Screens, userFeedback } from '../ScreenController'

export const ScreenContext = createContext({
  /**
   * Shows a context menu
   *
   * @returns a promise with no return value that gets resolved when the context
   * menu disapears again regardless what action the user took or if they
   * canceled the dialog
   */
  openContextMenu: async (..._args: Parameters<OpenContextMenu>) => {},
  userFeedback: (_message: false | userFeedback) => {},
  changeScreen: (_screen: Screens) => {},
  screen: null as Screens | null,
})
