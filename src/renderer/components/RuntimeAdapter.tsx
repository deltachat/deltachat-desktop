import React, { useEffect } from 'react'

import useMessage from '../hooks/chat/useMessage'
import useProcessQr from '../hooks/useProcessQr'
import { clearNotificationsForChat } from '../system-integration/notifications'
import { runtime } from '../runtime'

import type { PropsWithChildren } from 'react'

type Props = {
  accountId?: number
}

/**
 * Helper component to hook React methods into the external "runtime". This
 * allows us to interact with the underlying Electron runtime and
 * operating system.
 */
export default function RuntimeAdapter({
  accountId,
  children,
}: PropsWithChildren<Props>) {
  const processQr = useProcessQr()
  const { jumpToMessage } = useMessage()

  useEffect(() => {
    runtime.onOpenQrUrl = (url: string) => {
      if (!accountId) {
        throw new Error('accountId is not set')
      }

      processQr(accountId, url)
    }

    runtime.setNotificationCallback(
      async ({ accountId: notificationAccountId, msgId, chatId }) => {
        if (accountId !== notificationAccountId) {
          await window.__selectAccount(notificationAccountId)
        }

        if (chatId !== 0) {
          clearNotificationsForChat(notificationAccountId, chatId)

          if (msgId !== 0) {
            jumpToMessage(notificationAccountId, msgId, true)
          }
        }
      }
    )
  }, [accountId, jumpToMessage, processQr])

  return <>{children}</>
}
