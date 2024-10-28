import { useCallback } from 'react'

import useChat from './useChat'
import { BackendRemote } from '../../backend-com'
import { ChatView } from '../../contexts/ChatContext'
import { getLogger } from '../../../../shared/logger'

import type { T } from '@deltachat/jsonrpc-client'

export type JumpToMessage = (params: {
  accountId: number
  msgId: number
  /**
   * Optional, but if it is known, it's best to provide it
   * for better performance.
   * When provided, the caller guarantees that
   * `msgChatId === await rpc.getMessage(accountId, msgId)).chatId`.
   */
  msgChatId?: number
  highlight?: boolean
  msgParentId?: number
}) => Promise<void>

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
  quotedText: null,
  text: null,
}

export default function useMessage() {
  const { chatId, setChatView, selectChat } = useChat()

  const jumpToMessage = useCallback<JumpToMessage>(
    async ({ accountId, msgId, msgChatId, highlight = true, msgParentId }) => {
      log.debug(`jumpToMessage with messageId: ${msgId}`)

      if (msgChatId == undefined) {
        msgChatId = (await BackendRemote.rpc.getMessage(accountId, msgId))
          .chatId
      }
      // Check if target message is in same chat, if not switch first
      if (msgChatId !== chatId) {
        await selectChat(accountId, msgChatId)
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
      const msgId = await BackendRemote.rpc.sendMsg(accountId, chatId, {
        ...MESSAGE_DEFAULT,
        ...message,
      })

      // Jump down on sending
      jumpToMessage({ accountId, msgId, msgChatId: chatId, highlight: false })
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
