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
  KeybindingCheatSheet_Open = 'keybindinginfo:open',
  MessageList_PageUp = 'msglist:pageup',
  MessageList_PageDown = 'msglist:pagedown',
  GlobalGallery_Open = 'globalgallery:open',

  // Actions that are not necessarily triggered by keybindings
  ChatList_SwitchToArchiveView = 'chatlist:switch-to-archive-view',
  ChatList_SwitchToNormalView = 'chatlist:switch-to-normal-view',

  // Composite Actions (actions that trigger other actions)
  ChatList_FocusAndClearSearchInput = 'chatlist:focus-and-clear-search',
  ChatList_ExitSearch = 'chatlist:exit-search',
  ChatList_SearchSelectFirstChat = 'chatlist:search-select-first-chat',

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

export function keyDownEvent2Action(
  ev: KeyboardEvent
): KeybindAction | undefined {
  if (window.__contextMenuActive) {
    return
  }
  if (!ev.repeat) {
    // fire only on first press
    if (ev.altKey && ev.key === 'ArrowDown') {
      return KeybindAction.ChatList_SelectNextChat
    } else if (ev.altKey && ev.key === 'ArrowUp') {
      return KeybindAction.ChatList_SelectPreviousChat
      // } else if (ev.altKey && ev.key === 'ArrowLeft') {
      // disabled until we find a better keycombination (see https://github.com/deltachat/deltachat-desktop/issues/1796)
      //   return KeybindAction.ChatList_ScrollToSelectedChat
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
    } else if (ev.key === 'F5') {
      return KeybindAction.Debug_MaybeNetwork
    } else if (ev.key === 'PageUp') {
      return KeybindAction.MessageList_PageUp
    } else if (ev.key === 'PageDown') {
      return KeybindAction.MessageList_PageDown
    } else if ((ev.metaKey || ev.ctrlKey) && ev.key === '/') {
      return KeybindAction.KeybindingCheatSheet_Open
    }
  } else {
    // fire continuesly as long as button is pressed
    if (ev.key === 'PageUp') {
      return KeybindAction.MessageList_PageUp
    } else if (ev.key === 'PageDown') {
      return KeybindAction.MessageList_PageDown
    } else if (ev.altKey && ev.key === 'ArrowDown') {
      return KeybindAction.ChatList_SelectNextChat
    } else if (ev.altKey && ev.key === 'ArrowUp') {
      return KeybindAction.ChatList_SelectPreviousChat
    }
  }
}

// Implementation of Composite Actions (actions that trigger other actions)

ActionEmitter.registerHandler(
  KeybindAction.ChatList_FocusAndClearSearchInput,
  () => {
    ActionEmitter.emitAction(KeybindAction.ChatList_FocusSearchInput)
    ActionEmitter.emitAction(KeybindAction.ChatList_ClearSearchInput)
  }
)

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
