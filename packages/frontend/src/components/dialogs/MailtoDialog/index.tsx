import React from 'react'
import { C } from '@deltachat/jsonrpc-client'

import useCreateDraftMessage from '../../../hooks/chat/useCreateDraftMesssage'
import useTranslationFunction from '../../../hooks/useTranslationFunction'

import type { DialogProps } from '../../../contexts/DialogContext'
import SelectChat from '../SelectChat'

type Props = {
  messageText: string
}

export default function MailtoDialog(props: Props & DialogProps) {
  const { onClose, messageText } = props

  const tx = useTranslationFunction()
  const createDraftMessage = useCreateDraftMessage()

  const onChatClick = async ({
    targetAccountId,
    chatId,
  }: {
    targetAccountId: number
    chatId: number
  }) => {
    // Close dialog before createDraftMessage because it may switch accounts
    onClose()
    await createDraftMessage(targetAccountId, chatId, messageText)
  }

  return (
    <SelectChat
      headerTitle={tx('mailto_dialog_header_select_chat')}
      onChatClick={onChatClick}
      onClose={onClose}
      listFlags={C.DC_GCL_FOR_FORWARDING | C.DC_GCL_NO_SPECIALS}
      enableAccountSwitch
    />
  )
}
