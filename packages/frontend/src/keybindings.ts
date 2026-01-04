import { getLogger } from '../../shared/logger'

const log = getLogger('renderer/keybindings')

export enum KeybindAction {
  ChatList_SelectNextChat = 'chatlist:select-next-chat',
  ChatList_SelectPreviousChat = 'chatlist:select-previous-chat',
  ChatList_ScrollToSelectedChat = 'chatlist:scroll-to-selected-chat',
  /**
   * "Items" instead of "Chats" because searching might show
   * messages and contacts and not just chats.
   */
  ChatList_FocusItems = 'chatlist:focus-items',
  // ChatList_SelectFirstChat = 'chatlist:select-first-chat',
  ChatList_FocusSearchInput = 'chatlist:focus-search',
  ChatList_SearchInChat = 'chatlist:search-in-chat',
  ChatList_ClearSearchInput = 'chatlist:clear-search',
  Composer_Focus = 'composer:focus',
  Composer_SelectReplyToUp = 'composer:select-reply-to-up',
  Composer_SelectReplyToDown = 'composer:select-reply-to-down',
  Composer_CancelReply = 'composer:cancel-reply',
  NewChat_Open = 'new-chat:open',
  Settings_Open = 'settings:open',
  KeybindingCheatSheet_Open = 'keybindinginfo:open',
  MessageList_PageUp = 'msglist:pageup',
  MessageList_PageDown = 'msglist:pagedown',
  GlobalGallery_Open = 'globalgallery:open',

  // Actions that are not necessarily triggered by keybindings
  ChatList_SwitchToArchiveView = 'chatlist:switch-to-archive-view',
  ChatList_SwitchToNormalView = 'chatlist:switch-to-normal-view',
  AboutDialog_Open = 'about:open',

  // Composite Actions (actions that trigger other actions)
  // ChatList_FocusAndClearSearchInput = 'chatlist:focus-and-clear-search',
  ChatList_ExitSearch = 'chatlist:exit-search',
  // ChatList_SearchSelectFirstChat = 'chatlist:search-select-first-chat',

  // Debug
  Debug_MaybeNetwork = 'debug:maybe_network',
}

export namespace ActionEmitter {
  const handlers: Partial<{ [key in KeybindAction]: any[] }> = {}

  export function registerHandler(action: KeybindAction, handler: () => void) {
    if (!Array.isArray(handlers[action])) {
      handlers[action] = []
    }
    ;(handlers[action] as any[]).push(handler)
  }

  export function unRegisterHandler(
    action: KeybindAction,
    handler: () => void
  ) {
    if (!Array.isArray(handlers[action])) {
      return
    }
    handlers[action] = (handlers[action] as any[]).filter(h => h !== handler)
  }

  export function emitAction(action: KeybindAction) {
    if (!Array.isArray(handlers[action])) {
      return
    }
    log.debug('fire action', action, 'handlers:', handlers[action])
    ;(handlers[action] as any[]).forEach(handler => handler())
  }
}

/**
 * Detect if the keyboard layout produces Latin letters for letter keys.
 * On Latin-based layouts (US, German, French), letter keys produce a-z.
 * On non-Latin layouts (Russian, Greek, Arabic), letter keys produce other scripts.
 */
function isLatinLayout(ev: KeyboardEvent): boolean {
  // If we're pressing a letter key (KeyA-KeyZ), check if it produces a Latin letter
  if (ev.code.startsWith('Key') && ev.code.length === 4) {
    return /^[a-zA-Z]$/.test(ev.key)
  }
  // For non-letter keys, we can't determine layout from this event
  return true
}

/**
 * Helper for letter-based shortcuts (Ctrl+F, Ctrl+N, etc.)
 * Works correctly for both Latin layouts (German, French) and non-Latin layouts (Russian, Greek).
 * - On Latin layouts: matches by ev.key (the character produced)
 * - On non-Latin layouts: falls back to ev.code (physical key position)
 */
function matchesLetterShortcut(ev: KeyboardEvent, letter: string): boolean {
  const lower = letter.toLowerCase()
  const code = `Key${letter.toUpperCase()}`

  if (ev.key.toLowerCase() === lower) {
    return true // Direct match (works for all Latin layouts)
  }
  // Fallback to physical position for non-Latin layouts
  return !isLatinLayout(ev) && ev.code === code
}

/**
 * Helper for non-letter shortcuts (Ctrl+/, Ctrl+,, etc.)
 * Matches by character, with fallback to physical position only for non-ASCII keys.
 * This prevents capturing unintended shortcuts like Ctrl+- when we want Ctrl+/
 * (on German keyboards, the Slash position produces '-').
 */
function matchesNonLetterShortcut(
  ev: KeyboardEvent,
  symbol: string,
  code: string
): boolean {
  if (ev.key === symbol) {
    return true // Direct character match
  }
  // Only fall back to code if ev.key is NOT a printable ASCII character.
  // This prevents capturing e.g. Ctrl+- when we want Ctrl+/
  const isPrintableAscii = ev.key.length === 1 && ev.key >= ' ' && ev.key <= '~'
  return !isPrintableAscii && ev.code === code
}

export function keyDownEvent2Action(
  ev: KeyboardEvent
): KeybindAction | undefined {
  if (window.__contextMenuActive) {
    return
  }
  // Don't capture keys during IME composition (Chinese, Japanese, Korean input)
  if (ev.isComposing) {
    return
  }
  // When modifying this, don't forget to also update the corresponding
  // `aria-keyshortcuts` properties, and the "Keybindings" help window.
  if (!ev.repeat) {
    // fire only on first press
    if (ev.altKey && ev.code === 'ArrowDown') {
      return KeybindAction.ChatList_SelectNextChat
    } else if (ev.altKey && ev.code === 'ArrowUp') {
      return KeybindAction.ChatList_SelectPreviousChat
    } else if (ev.ctrlKey && ev.code === 'PageDown') {
      return KeybindAction.ChatList_SelectNextChat
    } else if (ev.ctrlKey && ev.code === 'PageUp') {
      return KeybindAction.ChatList_SelectPreviousChat
    } else if (ev.ctrlKey && ev.code === 'Tab') {
      return !ev.shiftKey
        ? KeybindAction.ChatList_SelectNextChat
        : KeybindAction.ChatList_SelectPreviousChat
      // } else if (ev.altKey && ev.code === 'ArrowLeft') {
      // disabled until we find a better keycombination (see https://github.com/deltachat/deltachat-desktop/issues/1796)
      //   return KeybindAction.ChatList_ScrollToSelectedChat
      // }
    } else if ((ev.metaKey || ev.ctrlKey) && matchesLetterShortcut(ev, 'f')) {
      // https://github.com/deltachat/deltachat-desktop/issues/4579
      if (ev.shiftKey) {
        return KeybindAction.ChatList_SearchInChat
      }
      return KeybindAction.ChatList_FocusSearchInput
    } else if ((ev.metaKey || ev.ctrlKey) && matchesLetterShortcut(ev, 'n')) {
      return KeybindAction.NewChat_Open
    } else if (ev.ctrlKey && matchesLetterShortcut(ev, 'm')) {
      return KeybindAction.Composer_Focus
    } else if (
      // Also consider adding this to `ev.repeat` when it stops being so sluggish
      ev.code === 'ArrowUp' &&
      (ev.ctrlKey || ev.metaKey) &&
      !(ev.ctrlKey && ev.metaKey) && // Both at the same time
      (ev.target as HTMLElement)?.id === 'composer-textarea'
    ) {
      return KeybindAction.Composer_SelectReplyToUp
    } else if (
      ev.code === 'ArrowDown' &&
      (ev.ctrlKey || ev.metaKey) &&
      !(ev.ctrlKey && ev.metaKey) && // Both at the same time
      (ev.target as HTMLElement)?.id === 'composer-textarea'
    ) {
      return KeybindAction.Composer_SelectReplyToDown
    } else if (
      (ev.metaKey || ev.ctrlKey) &&
      matchesNonLetterShortcut(ev, ',', 'Comma')
    ) {
      return KeybindAction.Settings_Open
    } else if (ev.code === 'Escape') {
      if ((ev.target as any).id === 'chat-list-search') {
        return KeybindAction.ChatList_ExitSearch
      } else if ((ev.target as any).id === 'composer-textarea') {
        return KeybindAction.Composer_CancelReply
      }
    } else if (
      (ev.target as any).id === 'chat-list-search' &&
      (ev.key === 'Enter' || ev.code === 'ArrowDown')
    ) {
      // return KeybindAction.ChatList_SearchSelectFirstChat
      return KeybindAction.ChatList_FocusItems
    } else if (ev.code === 'F5') {
      return KeybindAction.Debug_MaybeNetwork
    } else if (ev.code === 'PageUp') {
      if ((ev.target as HTMLElement)?.id === 'composer-textarea') {
        return KeybindAction.MessageList_PageUp
      }
    } else if (ev.code === 'PageDown') {
      if ((ev.target as HTMLElement)?.id === 'composer-textarea') {
        return KeybindAction.MessageList_PageDown
      }
    } else if (
      (ev.metaKey || ev.ctrlKey) &&
      matchesNonLetterShortcut(ev, '/', 'Slash')
    ) {
      return KeybindAction.KeybindingCheatSheet_Open
    }
  } else {
    // fire continuesly as long as button is pressed
    if (ev.ctrlKey && ev.code === 'PageDown') {
      return KeybindAction.ChatList_SelectNextChat
    } else if (ev.ctrlKey && ev.code === 'PageUp') {
      return KeybindAction.ChatList_SelectPreviousChat
    } else if (ev.code === 'PageUp') {
      if ((ev.target as HTMLElement)?.id === 'composer-textarea') {
        return KeybindAction.MessageList_PageUp
      }
    } else if (ev.code === 'PageDown') {
      if ((ev.target as HTMLElement)?.id === 'composer-textarea') {
        return KeybindAction.MessageList_PageDown
      }
    } else if (ev.altKey && ev.code === 'ArrowDown') {
      return KeybindAction.ChatList_SelectNextChat
    } else if (ev.altKey && ev.code === 'ArrowUp') {
      return KeybindAction.ChatList_SelectPreviousChat
    }
  }
}

// Implementation of Composite Actions (actions that trigger other actions)

// ActionEmitter.registerHandler(
//   KeybindAction.ChatList_FocusAndClearSearchInput,
//   () => {
//     ActionEmitter.emitAction(KeybindAction.ChatList_FocusSearchInput)
//     ActionEmitter.emitAction(KeybindAction.ChatList_ClearSearchInput)
//   }
// )

ActionEmitter.registerHandler(KeybindAction.ChatList_ExitSearch, () => {
  ActionEmitter.emitAction(KeybindAction.ChatList_ClearSearchInput)
  ActionEmitter.emitAction(KeybindAction.Composer_Focus)
})

// ActionEmitter.registerHandler(
//   KeybindAction.ChatList_SearchSelectFirstChat,
//   () => {
//     ActionEmitter.emitAction(KeybindAction.ChatList_SelectFirstChat)
//     ActionEmitter.emitAction(KeybindAction.Composer_Focus)
//   }
// )
