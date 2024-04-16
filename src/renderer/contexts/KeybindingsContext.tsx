import React, { createContext, useEffect } from 'react'

import {
  ActionEmitter,
  KeybindAction,
  keyDownEvent2Action,
} from '../keybindings'
import useKeyBindingAction from '../hooks/useKeyBindingAction'
import useDialog from '../hooks/dialog/useDialog'
import { Screens } from '../ScreenController'
import KeybindingCheatSheet from '../components/dialogs/KeybindingCheatSheet'
import Settings from '../components/Settings'

import type { PropsWithChildren } from 'react'

export const KeybindingsContext = createContext(null)

export const KeybindingsContextProvider = ({
  children,
}: PropsWithChildren<{}>) => {
  const { openDialog } = useDialog()

  // @TODO: This probably needs another place
  useKeyBindingAction(KeybindAction.Settings_Open, () => {
    if (window.__screen === Screens.Main) {
      // Only if user is logged in & open settings if not already opened
      if (!window.__settingsOpened) {
        openDialog(Settings)
      }
    }
  })

  // @TODO: This probably needs another place
  useKeyBindingAction(KeybindAction.KeybindingCheatSheet_Open, () => {
    if (!window.__keybindingsDialogOpened) {
      openDialog(KeybindingCheatSheet)
    }
  })

  useEffect(() => {
    const handleKeydown = (event: KeyboardEvent) => {
      const action = keyDownEvent2Action(event)

      if (action) {
        event.stopImmediatePropagation()
        event.preventDefault()
        ActionEmitter.emitAction(action)
      }
    }

    document.addEventListener('keydown', handleKeydown)

    return () => {
      document.removeEventListener('keydown', handleKeydown)
    }
  })

  return (
    <KeybindingsContext.Provider value={null}>
      {children}
    </KeybindingsContext.Provider>
  )
}
