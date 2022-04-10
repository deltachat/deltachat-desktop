import React, { useEffect, useState } from 'react'
import { DesktopSettingsType } from '../../shared/shared-types'
import { runtime } from '../runtime'

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

function get_label(keyboard_key: string) {
  if (runtime.getRuntimeInfo().isMac) {
    switch (keyboard_key) {
      case 'Alt':
        return 'Option'
      case 'Meta':
        return 'Command'
      default:
        return keyboard_key
    }
  } else {
    switch (keyboard_key) {
      case 'Control':
        // German seems to be the only language that uses another label for the control key
        return window.localeData.locale == 'de' ? 'Strg' : 'Ctrl'
      default:
        return keyboard_key
    }
  }
}

function Key({ keyboard_key }: { keyboard_key: string }) {
  const [pressed, setPressed] = useState(false)

  useEffect(() => {
    const onKeyDown = (ev: KeyboardEvent) => {
      if (keyboard_key === ev.key) {
        setPressed(true)
      }
    }
    const onKeyUp = (ev: KeyboardEvent) => {
      if (keyboard_key === ev.key) {
        setPressed(false)
      }
    }
    document.addEventListener('keydown', onKeyDown)
    document.addEventListener('keyup', onKeyUp)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.removeEventListener('keyup', onKeyUp)
    }
  }, [keyboard_key])

  const shouldHideLabel = showOnlySymbolOn.indexOf(keyboard_key) !== -1

  return (
    <kbd className={pressed ? 'key pressed' : 'key'}>
      {shouldHideLabel || get_label(keyboard_key)}
      {keySymbols[keyboard_key]
        ? (shouldHideLabel ? '' : ' ') + keySymbols[keyboard_key]
        : ''}
    </kbd>
  )
}

export type ShortcutAction = {
  title: string
  keyBindings: (string[] | boolean)[]
}

export function KeyboardShortcut({ elements }: { elements: string[] }) {
  const binding_elements = []

  for (const element of elements) {
    binding_elements.push(<Key key={element} keyboard_key={element} />)
    binding_elements.push(' + ')
  }

  if (binding_elements.length !== 0) {
    binding_elements.pop()
  }

  return <div className='keybinding'>{binding_elements}</div>
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

  const Enter = ['Enter']
  const CtrlEnter = ['Control', 'Enter']
  const MetaEnter = ['Meta', 'Enter']
  const CtrlOrMetaEnter = isMac ? MetaEnter : CtrlEnter
  const ShiftEnter = ['Shift', 'Enter']

  if (enterKeySends) {
    return [
      { title: 'Send Message', keyBindings: [Enter] },
      {
        title: 'Insert Newline',
        keyBindings: [ShiftEnter, CtrlOrMetaEnter],
      },
    ]
  } else {
    return [
      {
        title: 'Send Message',
        keyBindings: [CtrlOrMetaEnter, ShiftEnter],
      },
      {
        title: 'Insert Newline',
        keyBindings: [Enter],
      },
    ]
  }
}

export type CheatSheetEntryType =
  | { title: string; type: 'header' }
  | { action: ShortcutAction; type: 'shortcut' }

function Title(title: string): CheatSheetEntryType {
  return { title, type: 'header' }
}
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
  return [
    Title('MessageInput / Composer'),
    ...enterKeySendsKeyboardShortcuts(settings['enterKeySends']).map(Shortcut),
    Title('Global Shortcuts'),
    ...[
      {
        title: 'Switch between Chats',
        keyBindings: [
          ['Alt', 'ArrowUp'],
          ['Alt', 'ArrowDown'],
        ],
      },
      { title: 'Scroll Messages', keyBindings: [['PageUp'], ['PageDown']] },
      { title: 'Jump to Search', keyBindings: [['Control', 'K']] },
      { title: 'Focus Composer', keyBindings: [['Control', 'N']] },
      { title: 'Open Help', keyBindings: [['F1']] },
      {
        title: 'Open Settings',
        keyBindings: [['Control', ','], isMac && ['Meta', ',']],
      },
      { title: 'Force Refresh Network', keyBindings: [['F5']] },
    ].map(Shortcut),
  ]
}
