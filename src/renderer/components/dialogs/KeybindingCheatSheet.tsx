import React, { useEffect } from 'react'
import { useTranslationFunction } from '../../contexts'
import { useSettingsStore } from '../../stores/settings'
import {
  CheatSheetKeyboardShortcut,
  getKeybindings,
  ShortcutGroup,
} from '../KeyboardShortcutHint'
import {
  DeltaDialogBase,
  DeltaDialogBody,
  DeltaDialogHeader,
} from './DeltaDialog'

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
    <DeltaDialogBase
      isOpen={isOpen}
      onClose={onClose}
      fixed={false}
      className='keyboard-hint-cheatsheet-dialog'
      showCloseButton={true}
    >
      <DeltaDialogHeader onClose={onClose} showCloseButton={true}>
        <h4 className='bp4-heading'>{tx('keybindings')}</h4>
        <CheatSheetKeyboardShortcut />
      </DeltaDialogHeader>

      <DeltaDialogBody>
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
      </DeltaDialogBody>
    </DeltaDialogBase>
  )
}
