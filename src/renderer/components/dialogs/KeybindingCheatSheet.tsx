import React, { useContext } from 'react'
import { SettingsContext } from '../../contexts'
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
  // const tx = useTranslationFunction()

  const { desktopSettings } = useContext(SettingsContext)

  return (
    <DeltaDialogBase
      isOpen={isOpen}
      onClose={onClose}
      fixed={false}
      className='keyboard-hint-cheatsheet-dialog'
      showCloseButton={true}
    >
      <DeltaDialogHeader onClose={onClose} showCloseButton={true}>
        <h4 className='bp3-heading'>Keybindings</h4>
        <CheatSheetKeyboardShortcut />
      </DeltaDialogHeader>

      <DeltaDialogBody>
        <div className='keyboard-hint-dialog-body'>
          {desktopSettings &&
            getKeybindings(desktopSettings).map(entry => {
              if (entry.type === 'header') {
                return (
                  <div key={entry.title}>
                    <div className='line'/>
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
