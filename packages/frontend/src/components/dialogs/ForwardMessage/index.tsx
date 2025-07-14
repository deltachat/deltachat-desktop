import React from 'react'
import { C } from '@deltachat/jsonrpc-client'

import { BackendRemote } from '../../../backend-com'
import { selectedAccountId } from '../../../ScreenController'
import { confirmForwardMessage } from '../../message/messageFunctions'
import useChat from '../../../hooks/chat/useChat'
import useDialog from '../../../hooks/dialog/useDialog'
import useMessage from '../../../hooks/chat/useMessage'
import useTranslationFunction from '../../../hooks/useTranslationFunction'

import type { T } from '@deltachat/jsonrpc-client'
import type { DialogProps } from '../../../contexts/DialogContext'
import SelectChatOrContact from '../SelectChatOrContact'

type ForwardMessageProps = {
  message: T.Message
  onClose: DialogProps['onClose']
}

export default function ForwardMessage(props: ForwardMessageProps) {
  const { message, onClose } = props

  const accountId = selectedAccountId()
  const tx = useTranslationFunction()
  const { openDialog } = useDialog()
  const { selectChat } = useChat()
  const { forwardMessage, jumpToMessage } = useMessage()

  const jumpToForwardedMessage = async (chatId: number) => {
    // get the id of forwarded message
    // to jump to the message
    const messageIds = await BackendRemote.rpc.getMessageIds(
      accountId,
      chatId,
      false,
      true
    )
    const lastMessage = messageIds[messageIds.length - 1]
    if (lastMessage) {
      jumpToMessage({
        accountId,
        msgId: lastMessage,
        msgChatId: chatId,
        focus: false,
      })
    }
  }

  const onChatClick = async (chatId: number) => {
    const chat = await BackendRemote.rpc.getBasicChatInfo(accountId, chatId)
    onClose()
    if (chat.isSelfTalk) {
      return await forwardMessage(accountId, message.id, chat.id)
    }
    // show the target chat to avoid unintended forwarding to the wrong chat
    selectChat(accountId, chat.id)
    const yes = await confirmForwardMessage(
      openDialog,
      accountId,
      message,
      chat
    )
    if (yes) {
      await jumpToForwardedMessage(chatId)
    } else {
      selectChat(accountId, message.chatId)
    }
  }

  const onContactClick = async (contactId: number) => {
    // (treefit): This always creates the chat with the contact, if it does not exist yet
    //  there is no additional confirmation dialog, as that would be annyoing
    // (treefit): I also considered deleting the newly created chat after if forwarding is canceled,
    //  but deletion is a destructive action, any bugs there would result in dataloss, so not worth the risk IMO
    const chatId = await BackendRemote.rpc.createChatByContactId(
      accountId,
      contactId
    )
    await onChatClick(chatId)
  }

  return (
    <SelectChatOrContact
      headerTitle={tx('forward_to')}
      onChatClick={onChatClick}
      onContactClick={onContactClick}
      onClose={onClose}
    />
  )
}
