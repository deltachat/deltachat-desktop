import { useCallback } from 'react'

import useChat from './useChat'
import { BackendRemote } from '../../backend-com'
import { getLogger } from '../../../../shared/logger'
import { notifyWebxdcMessageSent } from '../useWebxdcMessageSent'

import type { T } from '@deltachat/jsonrpc-client'

export type JumpToMessage = (params: {
  // "not from a different account" because apparently
  // `selectAccount` throws if `nextAccountId` is not the same
  // as the current account ID.
  //
  // TODO refactor: can't we just remove this property then?
  /**
   * The ID of the currently selected account.
   * jumpToMessage from `useMessage()` _cannot_ jump to messages
   * of different accounts.
   */
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
  focus: boolean
  /**
   * The ID of the message to remember,
   * to later go back to it, using the "jump down" button.
   *
   * This has no effect if `msgId` and `msgParentId` belong to different chats.
   * Because otherwise if the user pops the stack
   * by clicking the "jump down" button,
   * we'll erroneously show messages from the previous chat
   * without actually switching to that chat.
   */
  msgParentId?: number
  /**
   * `behavior: 'smooth'` should not be used due to "scroll locking":
   * they don't behave well together currently.
   * `inline` also isn't supposed to have effect because
   * the messages list should not be horizontally scrollable.
   */
  scrollIntoViewArg?: Parameters<HTMLElement['scrollIntoView']>[0]
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
  filename: null,
  viewtype: null,
  html: null,
  location: null,
  overrideSenderName: null,
  quotedMessageId: null,
  quotedText: null,
  text: null,
}

export default function useMessage() {
  const { chatId, selectChat } = useChat()

  const jumpToMessage = useCallback<JumpToMessage>(
    async ({
      accountId,
      msgId,
      msgChatId,
      highlight = true,
      focus,
      msgParentId,
      scrollIntoViewArg,
    }) => {
      log.debug(`jumpToMessage with messageId: ${msgId}`)

      if (msgChatId == undefined) {
        msgChatId = (await BackendRemote.rpc.getMessage(accountId, msgId))
          .chatId
      }

      // Workaround to actual jump to message in regarding mounted component view
      // We must set this before the potential `await selectChat()`,
      // i.e. before the render of the message list
      // so that it shows the target message right away.
      window.__internal_jump_to_message_asap = {
        accountId,
        chatId: msgChatId,
        jumpToMessageArgs: [
          {
            msgId,
            highlight,
            focus,
            // Don't add to the stack if the message is in a different chat,
            // see `msgParentId` docstring.
            addMessageIdToStack: msgChatId === chatId ? msgParentId : undefined,
            scrollIntoViewArg,
          },
        ],
      }
      window.__internal_check_jump_to_message?.()

      // Check if target message is in same chat, if not switch first
      if (msgChatId !== chatId) {
        await selectChat(accountId, msgChatId)
      }

      window.__closeAllDialogs?.()
    },
    [chatId, selectChat]
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

      // Notify about the sent message (listeners can filter by message type if needed)
      notifyWebxdcMessageSent(accountId, chatId, message)

      // Jump down on sending
      jumpToMessage({
        accountId,
        msgId,
        msgChatId: chatId,
        highlight: false,
        focus: false,
      })
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
    /**
     * Makes the currently rendered MessageList component instance
     * load and scroll the message with the specified `msgId` into view.
     *
     * The specified message may be a message from a different chat,
     * but _not_ from a different account,
     * see {@link JumpToMessage['accountId']}.
     */
    jumpToMessage,
    sendMessage,
    forwardMessage,
    deleteMessage,
  }
}
