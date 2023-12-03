import React, { useEffect } from 'react'

import { useTranslationFunction } from '../../contexts'
import { useSettingsStore } from '../../stores/settings'
import {
  CheatSheetKeyboardShortcut,
  getKeybindings,
  ShortcutGroup,
} from '../KeyboardShortcutHint'
import Dialog, { DialogBody, DialogHeader, DialogHeading } from '../Dialog'

export default function KeybindingCheatSheet(props: {
  isOpen: boolean
  onClose: () => void
}) {
  const { isOpen, onClose } = props
  const tx = useTranslationFunction()

  const settingsStore = useSettingsStore()[0]

  useEffect(() => {
    window.__keybindingsDialogOpened = true
    return () => {
      window.__keybindingsDialogOpened = false
    }
  }, [])

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      className='keyboard-hint-cheatsheet-dialog'
    >
      <DialogHeader onClose={onClose}>
        <DialogHeading>
          {tx('keybindings')}
          &nbsp;&nbsp;
          <CheatSheetKeyboardShortcut />
        </DialogHeading>
      </DialogHeader>
      <DialogBody>
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
