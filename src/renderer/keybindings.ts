import { useEffect } from 'react'

function selectFirstChatListItem() {
  //stub
}

function setSearchInputValue(value: string) {
  const chatListSearch = document.querySelector('#chat-list-search')
  const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
    window.HTMLInputElement.prototype,
    'value'
  ).set
  nativeInputValueSetter.call(chatListSearch, value)
  const ev2 = new Event('input', { bubbles: true }) // eslint-disable-line
  chatListSearch.dispatchEvent(ev2)
}

// export default function attachKeybindingsListener() {
//   document.addEventListener('keydown', function(Event) {
//     // only listen to those events when logged in
//     if (!window.__isReady) return

//     if (Event.ctrlKey && Event.key === 'k') {
//       const chatListSearch = document.querySelector<HTMLElement>(
//         '#chat-list-search'
//       )
//       setSearchInputValue('')
//       chatListSearch.focus()
//     } else if (Event.ctrlKey && Event.key === 'n') {
//       document.querySelector<HTMLElement>('#composer-textarea').focus()
//     } else if ((Event.metaKey || Event.ctrlKey) && Event.key === ',') {
//       // open settings
//       if (window.__openDialog) {
//         window.__openDialog('Settings')
//       }
//     } else if (
//       Event.key === 'Escape' &&
//       (Event.target as any).id === 'chat-list-search'
//     ) {
//       setSearchInputValue('')
//       document.querySelector<HTMLElement>('#composer-textarea').focus()
//     } else if (
//       Event.key === 'Enter' &&
//       (Event.target as any).id === 'chat-list-search'
//     ) {
//       Event.preventDefault()
//       selectFirstChatListItem()
//       setSearchInputValue('')
//     }
//   })
// }

export enum KeybindAction {
  ChatList_SelectNextChat = 'chatlist:select-next-chat',
  ChatList_SelectPreviousChat = 'chatlist:select-previous-chat',
  ChatList_ScrollToSelectedChat = 'chatlist:scroll-to-selected-chat',
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
    handlers[action].filter(h => h === handler)
  }

  export function emitAction(action: KeybindAction) {
    if (!Array.isArray(handlers[action])) {
      return
    }
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
    }
  } else {
    // fire continuesly as long as button is pressed
  }
}

export default function attachKeybindingsListener() {
  document.addEventListener('keydown', function(ev) {
    let action = keyDownEvent2Action(ev)
    if (action) {
      // ev.stopImmediatePropagation()
      // ev.preventDefault()
      ActionEmitter.emitAction(action)
    }
  })
}

// Implementation of global/multi-step actions
