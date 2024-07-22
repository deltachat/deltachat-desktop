import React, { useEffect, useRef } from 'react'

import useMessage from '../hooks/chat/useMessage'
import useProcessQr from '../hooks/useProcessQr'
import { clearNotificationsForChat } from '../system-integration/notifications'
import { runtime } from '@deltachat-desktop/runtime-interface'

import type { PropsWithChildren } from 'react'
import { ActionEmitter, KeybindAction } from '../keybindings'
import useDialog from '../hooks/dialog/useDialog'
import WebxdcSaveToChatDialog from './dialogs/WebxdcSendToChat'
import { saveLastChatId } from '../backend/chat'
import useChat from '../hooks/chat/useChat'

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
  const { selectChat } = useChat()

  const { closeDialog, openDialog, closeAllDialogs } = useDialog()
  const openSendToDialogId = useRef<string | undefined>(undefined)

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
          closeAllDialogs()
          // selectAccount always loads the last used chat
          // by setting saveLastChatId we force to load immediately
          // the chat holding the notification message
          await saveLastChatId(notificationAccountId, chatId)
          await window.__selectAccount(notificationAccountId)
        } else if (chatId !== 0) {
          await selectChat(accountId, chatId)
          clearNotificationsForChat(notificationAccountId, chatId)
        }
        if (msgId) {
          window.__internal_jump_to_message?.(msgId)
        }
      }
    )

    runtime.onShowDialog = kind => {
      if (kind === 'about') {
        ActionEmitter.emitAction(KeybindAction.AboutDialog_Open)
      } else if (kind === 'keybindings') {
        ActionEmitter.emitAction(KeybindAction.KeybindingCheatSheet_Open)
      } else if (kind === 'settings') {
        ActionEmitter.emitAction(KeybindAction.Settings_Open)
      }
    }
  }, [accountId, jumpToMessage, processQr, selectChat, closeAllDialogs])

  useEffect(() => {
    runtime.onWebxdcSendToChat = (file, text) => {
      if (openSendToDialogId.current) {
        closeDialog(openSendToDialogId.current)
        openSendToDialogId.current = undefined
      }

      openSendToDialogId.current = openDialog(WebxdcSaveToChatDialog, {
        messageText: text,
        file,
      })
    }
  }, [closeDialog, openDialog])

  return <>{children}</>
}
