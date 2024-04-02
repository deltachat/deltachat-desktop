import React, { useEffect } from 'react'

import useMessage from '../hooks/useMessage'
import useProcessQr from '../hooks/useProcessQr'
import { clearNotificationsForChat } from '../system-integration/notifications'
import { runtime } from '../runtime'
import { selectedAccountId } from '../ScreenController'

import type { PropsWithChildren } from 'react'

/**
 * Helper component to hook React methods into the external "runtime". This
 * allows us to interact with the underlying Electron runtime and
 * operating system.
 */
export default function Runtime({ children }: PropsWithChildren<{}>) {
  const processQr = useProcessQr()
  const { jumpToMessage } = useMessage()

  useEffect(() => {
    runtime.onOpenQrUrl = (url: string) => {
      const accountId = selectedAccountId()
      processQr(accountId, url)
    }

    runtime.setNotificationCallback(async ({ accountId, msgId, chatId }) => {
      if (window.__selectedAccountId !== accountId) {
        await window.__selectAccount(accountId)
      }

      if (chatId !== 0) {
        clearNotificationsForChat(accountId, chatId)

        if (msgId !== 0) {
          jumpToMessage(accountId, msgId, true)
        }
      }
    })
  }, [jumpToMessage, processQr])

  return <>{children}</>
}
