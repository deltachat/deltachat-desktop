import { useCallback } from 'react'

import useChat from './useChat'
import { BackendRemote } from '../../backend-com'
import { createChatByContactId } from '../../backend/chat'

import type { T } from '@deltachat/jsonrpc-client'
import { basename } from 'path'

export type PrivateReply = (
  accountId: number,
  message: T.Message
) => Promise<void>

export default function usePrivateReply() {
  const { selectChat } = useChat()

  return useCallback<PrivateReply>(
    async (accountId, message) => {
      const quotedMessageId = message.id
      const contactId = message.fromId
      const chatId = await createChatByContactId(accountId, contactId)

      // retrieve existing draft to append the quotedMessageId
      const oldDraft = await BackendRemote.rpc.getDraft(accountId, chatId)
      const fileName =
        oldDraft?.fileName ?? (oldDraft?.file ? basename(oldDraft?.file) : null)
      await BackendRemote.rpc.miscSetDraft(
        accountId,
        chatId,
        oldDraft?.text || null,
        oldDraft?.file || null,
        fileName,
        quotedMessageId,
        'Text'
      )

      selectChat(accountId, chatId)
    },
    [selectChat]
  )
}
