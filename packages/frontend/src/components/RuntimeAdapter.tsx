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
import SettingsStoreInstance from '../stores/settings'
import { SCAN_CONTEXT_TYPE } from '../hooks/useProcessQr'

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

      processQr(accountId, url, SCAN_CONTEXT_TYPE.DEFAULT)
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
          window.__internal_jump_to_message_asap = {
            accountId: notificationAccountId,
            chatId,
            jumpToMessageArgs: [
              {
                msgId,
                scrollIntoViewArg: { block: 'center' },
                // We probably want the composer to be focused.
                focus: false,
              },
            ],
          }
          window.__internal_check_jump_to_message?.()
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
    runtime.onWebxdcSendToChat = async (file, text, account) => {
      if (openSendToDialogId.current) {
        closeDialog(openSendToDialogId.current)
        openSendToDialogId.current = undefined
      }

      if (account && account !== accountId) {
        await window.__selectAccount(account)
      }

      openSendToDialogId.current = openDialog(WebxdcSaveToChatDialog, {
        messageText: text,
        file,
      })
    }
  }, [closeDialog, openDialog, accountId])

  useEffect(() => {
    runtime.onToggleNotifications = () => {
      const settings = SettingsStoreInstance.getState()
      if (settings) {
        SettingsStoreInstance.effect.setDesktopSetting(
          'notifications',
          !settings.desktopSettings.notifications
        )
      }
    }
  }, [])

  return <>{children}</>
}
