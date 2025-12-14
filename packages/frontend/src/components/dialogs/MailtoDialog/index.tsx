import React from 'react'
import { C } from '@deltachat/jsonrpc-client'

import { selectedAccountId } from '../../../ScreenController'
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
  const accountId = selectedAccountId()

  const onChatClick = async (chatId: number) => {
    createDraftMessage(accountId, chatId, messageText)
    onClose()
  }

  return (
    <SelectChat
      headerTitle={tx('mailto_dialog_header_select_chat')}
      onChatClick={onChatClick}
      onClose={onClose}
      listFlags={C.DC_GCL_FOR_FORWARDING | C.DC_GCL_NO_SPECIALS}
    />
  )
}
