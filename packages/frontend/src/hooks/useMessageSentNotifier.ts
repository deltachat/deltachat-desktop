import { useState, useCallback, useEffect } from 'react'
import type { T } from '@deltachat/jsonrpc-client'

// Simple global state for message notifications
const messageListeners: Set<
  (accountId: number, chatId: number, message: Partial<T.MessageData>) => void
> = new Set()

export function notifyMessageSent(
  accountId: number,
  chatId: number,
  message: Partial<T.MessageData>
) {
  messageListeners.forEach(callback => callback(accountId, chatId, message))
}

/**
 * A notifier that allows components to subscribe to webxdc message sent events.
 * For cases where DC Event 'MsgsChanged' is not sufficient
 * (like on MainScreen where we want to update AppIcons immediately when a
 * Webxdc message is sent).
 */
export function useMessageSentNotifier() {
  const [listeners] = useState(() => messageListeners)

  const subscribe = useCallback(
    (
      callback: (
        accountId: number,
        chatId: number,
        message: Partial<T.MessageData>
      ) => void
    ) => {
      listeners.add(callback)

      return () => {
        listeners.delete(callback)
      }
    },
    [listeners]
  )

  return { subscribe }
}

// Hook to listen for messages in a specific chat
export function useMessageSentListener(
  accountId: number,
  chatId: number,
  onMessageSent: (message: Partial<T.MessageData>) => void
) {
  const { subscribe } = useMessageSentNotifier()

  useEffect(() => {
    const unsubscribe = subscribe((eventAccountId, eventChatId, message) => {
      if (eventAccountId === accountId && eventChatId === chatId) {
        onMessageSent(message)
      }
    })

    return unsubscribe
  }, [subscribe, accountId, chatId, onMessageSent])
}
