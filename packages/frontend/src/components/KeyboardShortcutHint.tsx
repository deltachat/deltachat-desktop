import React, { useEffect, useState } from 'react'
import { DesktopSettingsType } from '../../../shared/shared-types'
import { runtime } from '@deltachat-desktop/runtime-interface'

function getLabel(keyboardKey: string) {
  if (['ArrowUp', 'ArrowDown'].includes(keyboardKey)) {
    switch (keyboardKey) {
      case 'ArrowUp':
        return '↑'
      case 'ArrowDown':
        return '↓'
    }
  }
  if (runtime.getRuntimeInfo().isMac) {
    switch (keyboardKey) {
      case 'Alt':
        return 'Option'
      case 'Meta':
        return 'Command'
      default:
        return keyboardKey
    }
  } else {
    switch (keyboardKey) {
      case 'Control':
        // German seems to be the only language that uses another label for the control key
        return window.localeData.locale == 'de' ? 'Strg' : 'Ctrl'
      default:
        return keyboardKey
    }
  }
}

function Key({ keyboardKey }: { keyboardKey: string }) {
  const [pressed, setPressed] = useState(false)
  const isSymbol = keyboardKey === 'ArrowUp' || keyboardKey === 'ArrowDown'

  useEffect(() => {
    const onKeyDown = (ev: KeyboardEvent) => {
      if (keyboardKey === ev.key) {
        setPressed(true)
      }
    }
    const onKeyUp = (ev: KeyboardEvent) => {
      if (keyboardKey === ev.key) {
        setPressed(false)
      }
    }
    document.addEventListener('keydown', onKeyDown)
    document.addEventListener('keyup', onKeyUp)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.removeEventListener('keyup', onKeyUp)
    }
  }, [keyboardKey])

  const className = `key${pressed ? ' pressed' : ''}${isSymbol ? ' isSymbol' : ''}`

  return <kbd className={className}>{getLabel(keyboardKey)}</kbd>
}

export type ShortcutAction = {
  title: string
  keyBindings: (string[] | boolean)[]
}

export function KeyboardShortcut({ elements }: { elements: string[] }) {
  const bindingElements = []

  for (const element of elements) {
    bindingElements.push(<Key key={element} keyboardKey={element} />)
  }

  return <div className='keybinding'>{bindingElements}</div>
}

/** a group representing the same or similar actions  */
export function ShortcutGroup({ title, keyBindings }: ShortcutAction) {
  const non_empty = keyBindings.filter(
    e => typeof e !== 'boolean'
  ) as string[][]
  const bindings = non_empty.map((elements, index) => {
    return (
      <KeyboardShortcut
        elements={elements}
        key={`${index}-${elements.length}`}
      />
    )
  })

  return (
    <div className='shortcut-item'>
      <div className='shortcut-title'>{title}</div>
      <div className='shortcut-bindings'>{bindings}</div>
    </div>
  )
}

export function enterKeySendsKeyboardShortcuts(
  enterKeySends: boolean
): ShortcutAction[] {
  const { isMac } = runtime.getRuntimeInfo()
  const tx = window.static_translate

  const Enter = ['Enter']
  const CtrlEnter = ['Control', 'Enter']
  const MetaEnter = ['Meta', 'Enter']
  const CtrlOrMetaEnter = isMac ? MetaEnter : CtrlEnter
  const ShiftEnter = ['Shift', 'Enter']

  // FYI the send button's `aria-keyshortcuts` relies on this code,
  // in a not-so-beautiful way.
  if (enterKeySends) {
    return [
      {
        title: tx('send_message'),
        keyBindings: [Enter, CtrlOrMetaEnter],
      },
      {
        title: tx('insert_newline'),
        keyBindings: [ShiftEnter],
      },
    ]
  } else {
    return [
      {
        title: tx('send_message'),
        keyBindings: [CtrlOrMetaEnter],
      },
      {
        title: tx('insert_newline'),
        keyBindings: [Enter, ShiftEnter],
      },
    ]
  }
}

export type CheatSheetEntryType =
  | { title: string; type: 'header' }
  | { action: ShortcutAction; type: 'shortcut' }

function Shortcut(action: ShortcutAction): CheatSheetEntryType {
  return { action, type: 'shortcut' }
}

export function getKeybindings(
  settings: DesktopSettingsType
): CheatSheetEntryType[] {
  const { isMac } = runtime.getRuntimeInfo()
  const tx = window.static_translate

  const ctrl = isMac ? 'Meta' : 'Control'

  return [
    {
      title: tx('navigation_shortcut_section'),
      type: 'header',
    } as CheatSheetEntryType,
    ...[
      {
        title: tx('menu_new_chat'),
        keyBindings: [[ctrl, 'N']],
      },
      {
        title: tx('focus_search_input'),
        keyBindings: [[ctrl, 'F']],
      },
      {
        title: tx('search_in_chat'),
        keyBindings: [[ctrl, 'Shift', 'F']],
      },
      {
        title: tx('switch_between_chats'),
        keyBindings: [
          ['Alt', 'ArrowUp'],
          ['Alt', 'ArrowDown'],
          ['Control', 'PageUp'],
          ['Control', 'PageDown'],
          ['Control', 'Tab'],
          ['Control', 'Shift', 'Tab'],
        ],
      },
      {
        title: tx('scroll_messages'),
        keyBindings: [['PageUp'], ['PageDown']],
      },
      {
        title: tx('focus_message_input'),
        keyBindings: [['Control', 'M']],
      },
      {
        title: tx('menu_help'),
        keyBindings: [['F1']],
      },
      {
        title: tx('menu_settings'),
        keyBindings: [['Control', ','], isMac && ['Meta', ',']],
      },
      {
        title: tx('force_refresh_network'),
        keyBindings: [['F5']],
      },
    ].map(Shortcut),
    {
      title: tx('message_input_shortcut_section'),
      type: 'header',
    } as CheatSheetEntryType,
    ...enterKeySendsKeyboardShortcuts(settings['enterKeySends']).map(Shortcut),
    ...[
      {
        title: tx('menu_reply'),
        keyBindings: [
          ['Control', 'ArrowUp'],
          ['Control', 'ArrowDown'],
        ],
      },
      {
        title: tx('global_menu_edit_desktop'),
        keyBindings: [['ArrowUp']],
      },
    ].map(Shortcut),
    {
      title: tx('message_selected_shortcut_section'),
      type: 'header',
    } as CheatSheetEntryType,
    ...[
      {
        title: tx('global_menu_edit_desktop'),
        keyBindings: [[ctrl, 'E']],
      },
      {
        title: tx('delete'),
        keyBindings: [['Delete']],
      },
      {
        title: tx('save'),
        keyBindings: [[ctrl, 'S']],
      },
      {
        title: tx('unsave'),
        keyBindings: [[ctrl, 'Shift', 'S']],
      },
      {
        title: tx('react'),
        keyBindings: [[ctrl, 'R']],
      },
    ].map(Shortcut),
  ]
}
