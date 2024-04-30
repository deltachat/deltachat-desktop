import { useCallback } from 'react'

import useChat from './useChat'
import { BackendRemote } from '../../backend-com'
import { ChatView } from '../../contexts/ChatContext'
import { getLogger } from '../../../shared/logger'

import type { T } from '@deltachat/jsonrpc-client'

export type JumpToMessage = (
  accountId: number,
  msgId: number,
  highlight?: boolean,
  msgParentId?: number
) => Promise<void>

export type SendMessage = (
  accountId: number,
  chatId: number,
  message: Partial<T.MessageData>
) => Promise<void>

export type ForwardMessage = (
  accountId: number,
  messageId: number,
  chatId: number
) => Promise<void>

export type DeleteMessage = (
  accountId: number,
  messageId: number
) => Promise<void>

const log = getLogger('hooks/useMessage')

const MESSAGE_DEFAULT: T.MessageData = {
  file: null,
  viewtype: null,
  html: null,
  location: null,
  overrideSenderName: null,
  quotedMessageId: null,
  text: null,
}

export default function useMessage() {
  const { chatId, setChatView, selectChat } = useChat()

  const jumpToMessage = useCallback<JumpToMessage>(
    async (
      accountId: number,
      msgId: number,
      highlight = true,
      msgParentId?: number
    ) => {
      log.debug(`jumpToMessage with messageId: ${msgId}`)

      // Check if target message is in same chat, if not switch first
      const message = await BackendRemote.rpc.getMessage(accountId, msgId)
      if (message.chatId !== chatId) {
        await selectChat(accountId, message.chatId)
      }
      setChatView(ChatView.MessageList)

      // Workaround to actual jump to message in regarding mounted component view
      setTimeout(() => {
        window.__internal_jump_to_message?.(msgId, highlight, msgParentId)
      }, 0)
    },
    [chatId, selectChat, setChatView]
  )

  const sendMessage = useCallback<SendMessage>(
    async (
      accountId: number,
      chatId: number,
      message: Partial<T.MessageData>
    ) => {
      const id = await BackendRemote.rpc.sendMsg(accountId, chatId, {
        ...MESSAGE_DEFAULT,
        ...message,
      })

      // Jump down on sending
      jumpToMessage(accountId, id, false)
    },
    [jumpToMessage]
  )

  const forwardMessage = useCallback<ForwardMessage>(
    async (accountId: number, messageId: number, chatId: number) => {
      await BackendRemote.rpc.forwardMessages(accountId, [messageId], chatId)
    },
    []
  )

  const deleteMessage = useCallback<DeleteMessage>(
    async (accountId: number, messageId: number) => {
      await BackendRemote.rpc.deleteMessages(accountId, [messageId])
    },
    []
  )

  return {
    jumpToMessage,
    sendMessage,
    forwardMessage,
    deleteMessage,
  }
}
