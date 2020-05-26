import { useEffect } from 'react'

import { getLogger } from '../shared/logger'

const log = getLogger('renderer/keybindings')

export enum KeybindAction {
  ChatList_SelectNextChat = 'chatlist:select-next-chat',
  ChatList_SelectPreviousChat = 'chatlist:select-previous-chat',
  ChatList_ScrollToSelectedChat = 'chatlist:scroll-to-selected-chat',
  ChatList_SelectFirstChat = 'chatlist:select-first-chat',
  ChatList_FocusSearchInput = 'chatlist:focus-search',
  ChatList_ClearSearchInput = 'chatlist:clear-search',
  Composer_Focus = 'composer:focus',
  Settings_Open = 'settings:open',

  // Composite Actions (actions that trigger other actions)
  ChatList_FocusAndClearSearchInput = 'chatlist:focus-and-clear-search',
  ChatList_ExitSearch = 'chatlist:exit-search',
  ChatList_SearchSelectFirstChat = 'chatlist:search-select-first-chat',
}

export namespace ActionEmitter {
  const handlers: Partial<{ [key in KeybindAction]: any[] }> = {}

  export function registerHandler(action: KeybindAction, handler: () => void) {
    if (!Array.isArray(handlers[action])) {
      handlers[action] = []
    }
    handlers[action].push(handler)
  }

  export function unRegisterHandler(
    action: KeybindAction,
    handler: () => void
  ) {
    if (!Array.isArray(handlers[action])) {
      return
    }
    handlers[action] = handlers[action].filter(h => h !== handler)
  }

  export function emitAction(action: KeybindAction) {
    if (!Array.isArray(handlers[action])) {
      return
    }
    log.debug('fire action', action, 'handlers:', handlers[action])
    handlers[action].forEach(handler => handler())
  }
}

export function useKeyBindingAction(
  action: KeybindAction,
  handler: () => void
) {
  useEffect(() => {
    ActionEmitter.registerHandler(action, handler)
    return () => ActionEmitter.unRegisterHandler(action, handler)
  })
}

function keyDownEvent2Action(ev: KeyboardEvent): KeybindAction {
  if (!ev.repeat) {
    // fire only on first press
    if (ev.altKey && ev.key === 'ArrowDown') {
      return KeybindAction.ChatList_SelectNextChat
    } else if (ev.altKey && ev.key === 'ArrowUp') {
      return KeybindAction.ChatList_SelectPreviousChat
    } else if (ev.altKey && ev.key === 'ArrowLeft') {
      return KeybindAction.ChatList_ScrollToSelectedChat
    } else if (ev.ctrlKey && ev.key === 'k') {
      return KeybindAction.ChatList_FocusAndClearSearchInput
    } else if (ev.ctrlKey && ev.key === 'n') {
      return KeybindAction.Composer_Focus
    } else if ((ev.metaKey || ev.ctrlKey) && ev.key === ',') {
      return KeybindAction.Settings_Open
    } else if (
      ev.key === 'Escape' &&
      (ev.target as any).id === 'chat-list-search'
    ) {
      return KeybindAction.ChatList_ExitSearch
    } else if (
      ev.key === 'Enter' &&
      (ev.target as any).id === 'chat-list-search'
    ) {
      return KeybindAction.ChatList_SearchSelectFirstChat
    }
  } else {
    // fire continuesly as long as button is pressed
  }
}

export default function attachKeybindingsListener() {
  document.addEventListener('keydown', function(ev) {
    let action = keyDownEvent2Action(ev)
    if (action) {
      ev.stopImmediatePropagation()
      ev.preventDefault()
      ActionEmitter.emitAction(action)
    }
  })
}

// Implementation of Composite Actions (actions that trigger other actions)

ActionEmitter.registerHandler(
  KeybindAction.ChatList_FocusAndClearSearchInput,
  () => {
    ActionEmitter.emitAction(KeybindAction.ChatList_FocusSearchInput)
    ActionEmitter.emitAction(KeybindAction.ChatList_ClearSearchInput)
  }
)

ActionEmitter.registerHandler(KeybindAction.Settings_Open, () => {
  if (window.__isReady) {
    // only if user is logged in
    // open settings
    if (window.__openDialog) {
      window.__openDialog('Settings')
    }
  }
})

ActionEmitter.registerHandler(KeybindAction.ChatList_ExitSearch, () => {
  ActionEmitter.emitAction(KeybindAction.ChatList_ClearSearchInput)
  ActionEmitter.emitAction(KeybindAction.Composer_Focus)
})

ActionEmitter.registerHandler(
  KeybindAction.ChatList_SearchSelectFirstChat,
  () => {
    ActionEmitter.emitAction(KeybindAction.ChatList_SelectFirstChat)
    ActionEmitter.emitAction(KeybindAction.Composer_Focus)
  }
)
