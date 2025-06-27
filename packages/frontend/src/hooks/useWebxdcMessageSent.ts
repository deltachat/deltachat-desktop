import { useCallback, useEffect } from 'react'
import type { T } from '@deltachat/jsonrpc-client'

// Simple global state for Webxdc message notifications
const webxdcMessageListeners: Set<(accountId: number, chatId: number) => void> =
  new Set()

export function notifyWebxdcMessageSent(
  accountId: number,
  chatId: number,
  message: Partial<T.MessageData>
) {
  // Only notify if the message is a Webxdc message
  if (
    message.viewtype === 'Webxdc' ||
    (message.filename && message.filename.endsWith('.xdc'))
  ) {
    webxdcMessageListeners.forEach(callback => {
      try {
        callback(accountId, chatId)
      } catch (_error: unknown) {
        // nothing to do here
      }
    })
  }
}

/**
 * A notifier that allows components to subscribe to Webxdc message sent events.
 * For cases where DC Event 'MsgsChanged' is not sufficient
 * (like on MainScreen where we want to update AppIcons immediately when a
 * Webxdc message is sent).
 */
export function useWebxdcMessageSentNotifier() {
  const subscribe = useCallback(
    (callback: (accountId: number, chatId: number) => void) => {
      webxdcMessageListeners.add(callback)

      return () => {
        webxdcMessageListeners.delete(callback)
      }
    },
    []
  )

  return { subscribe }
}

// Hook to listen for Webxdc messages in a specific chat
export function useWebxdcMessageSentListener(
  accountId: number,
  chatId: number,
  onWebxdcMessageSent: () => void
) {
  const { subscribe } = useWebxdcMessageSentNotifier()

  useEffect(() => {
    const unsubscribe = subscribe((eventAccountId, eventChatId) => {
      if (eventAccountId === accountId && eventChatId === chatId) {
        onWebxdcMessageSent()
      }
    })

    return unsubscribe
  }, [subscribe, accountId, chatId, onWebxdcMessageSent])
}
