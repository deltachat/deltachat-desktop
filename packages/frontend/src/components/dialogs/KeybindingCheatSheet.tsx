import React, { useEffect } from 'react'

import { useSettingsStore } from '../../stores/settings'
import {
  CheatSheetKeyboardShortcut,
  getKeybindings,
  ShortcutGroup,
} from '../KeyboardShortcutHint'
import Dialog, { DialogBody, DialogHeader, DialogHeading } from '../Dialog'
import useTranslationFunction from '../../hooks/useTranslationFunction'

import type { DialogProps } from '../../contexts/DialogContext'

export default function KeybindingCheatSheet(props: DialogProps) {
  const { onClose } = props
  const tx = useTranslationFunction()

  const settingsStore = useSettingsStore()[0]

  useEffect(() => {
    window.__keybindingsDialogOpened = true
    return () => {
      window.__keybindingsDialogOpened = false
    }
  }, [])

  return (
    <Dialog onClose={onClose} className='keyboard-hint-cheatsheet-dialog'>
      <DialogHeader onClose={onClose}>
        <DialogHeading>
          {tx('keybindings')}
          &nbsp;&nbsp;
          <CheatSheetKeyboardShortcut />
        </DialogHeading>
      </DialogHeader>
      <DialogBody className='dialog-body'>
        <div className='keyboard-hint-dialog-body'>
          {settingsStore &&
            getKeybindings(settingsStore.desktopSettings).map(entry => {
              if (entry.type === 'header') {
                return (
                  <div key={entry.title}>
                    <h2>{entry.title}</h2>
                  </div>
                )
              } else {
                const { action } = entry
                return (
                  <ShortcutGroup
                    title={action.title}
                    keyBindings={action.keyBindings}
                    key={action.title}
                  />
                )
              }
            })}
        </div>
      </DialogBody>
    </Dialog>
  )
}
