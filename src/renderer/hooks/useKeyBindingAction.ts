import { useEffect } from 'react'

import { ActionEmitter, KeybindAction } from '../keybindings'

export default function useKeyBindingAction(
  action: KeybindAction,
  handler: () => void
) {
  useEffect(() => {
    ActionEmitter.registerHandler(action, handler)
    return () => ActionEmitter.unRegisterHandler(action, handler)
  }, [action, handler])
}
