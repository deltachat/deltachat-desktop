import React, { useEffect, useState } from 'react'
import { DesktopSettingsType } from '../../../shared/shared-types'
import { runtime } from '../../../runtime/runtime'

const keySymbols: { [key: string]: string } = {
  Control: '^',
  Shift: '⇧',
  Alt: '⌥',
  Meta: '⌘',
  Enter: '↵',
  ArrowDown: '↓',
  ArrowUp: '↑',
}

const showOnlySymbolOn = ['ArrowDown', 'ArrowUp']

function getLabel(keyboardKey: string) {
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

  const shouldHideLabel = showOnlySymbolOn.indexOf(keyboardKey) !== -1

  return (
    <kbd className={pressed ? 'key pressed' : 'key'}>
      {shouldHideLabel || getLabel(keyboardKey)}
      {keySymbols[keyboardKey]
        ? (shouldHideLabel ? '' : ' ') + keySymbols[keyboardKey]
        : ''}
    </kbd>
  )
}

export type ShortcutAction = {
  title: string
  keyBindings: (string[] | boolean)[]
}

export function KeyboardShortcut({ elements }: { elements: string[] }) {
  const bindingElements = []

  for (const element of elements) {
    bindingElements.push(<Key key={element} keyboardKey={element} />)
    bindingElements.push(' + ')
  }

  if (bindingElements.length !== 0) {
    bindingElements.pop()
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
    <div className='action'>
      <div className='heading'>{title}</div>
      {bindings}
    </div>
  )
}

export function KeybordShortcutHintInSettings({
  actions,
}: {
  actions: ShortcutAction[]
}) {
  return (
    <div className='keyboard-hints-box'>
      {actions.map(action => (
        <ShortcutGroup
          key={action.title}
          title={action.title}
          keyBindings={action.keyBindings}
        />
      ))}
    </div>
  )
}

// export function KeybordShortcutHintPopover() {
//   return (
//     <div className='keyboard-hints-popover'>
//       <Action
//         title='Insert newline'
//         keyBindings={[
//           ['Ctrl', 'Enter'],
//           ['Shift', 'Enter'],
//         ]}
//       />
//       <Action title='Send' keyBindings={[['Enter']]} />
//       <div className='explainer'>
//         Change it in the <a href='#'>settings</a>.
//       </div>
//     </div>
//   )
// }

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

// function Title(title: string): CheatSheetEntryType {
//   return { title, type: 'header' }
// }
function Shortcut(action: ShortcutAction): CheatSheetEntryType {
  return { action, type: 'shortcut' }
}

export function CheatSheetKeyboardShortcut() {
  if (runtime.getRuntimeInfo().isMac) {
    return <KeyboardShortcut elements={['Meta', '/']} />
  } else {
    return <KeyboardShortcut elements={['Control', '/']} />
  }
}

export function getKeybindings(
  settings: DesktopSettingsType
): CheatSheetEntryType[] {
  const { isMac } = runtime.getRuntimeInfo()
  const tx = window.static_translate

  return [
    // Title(tx('desktop_keybindings_global')),
    ...[
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
        title: tx('focus_search_input'),
        keyBindings: [['Control', 'K']],
      },
      {
        title: tx('focus_message_input'),
        keyBindings: [['Control', 'N']],
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
    // Title(tx('desktop_keybindings_composer')),
    ...enterKeySendsKeyboardShortcuts(settings['enterKeySends']).map(Shortcut),
  ]
}
