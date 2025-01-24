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
import SelectChat from '../SelectChat'

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

  const onChatClick = async (chatId: number) => {
    const chat = await BackendRemote.rpc.getBasicChatInfo(accountId, chatId)
    onClose()
    if (!chat.isSelfTalk) {
      // show the target chat to avoid unintended forwarding to the wrong chat
      selectChat(accountId, chat.id)
      const yes = await confirmForwardMessage(
        openDialog,
        accountId,
        message,
        chat
      )
      if (yes) {
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
      } else {
        selectChat(accountId, message.chatId)
      }
    } else {
      await forwardMessage(accountId, message.id, chat.id)
    }
  }

  return (
    <SelectChat
      headerTitle={tx('forward_to')}
      onChatClick={onChatClick}
      onClose={onClose}
      listFlags={C.DC_GCL_FOR_FORWARDING | C.DC_GCL_NO_SPECIALS}
    />
  )
}
