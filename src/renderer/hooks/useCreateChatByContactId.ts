import { useCallback } from 'react'

import useChat from './useChat'
import { createChatByContactId } from '../backend/chat'
import { BackendRemote } from '../backend-com'

export default function useCreateChatByContactId() {
  const { selectChat } = useChat()

  return useCallback(
    async (accountId: number, contactId: number) => {
      const chatId = await createChatByContactId(accountId, contactId)
      const chat = await BackendRemote.rpc.getFullChatById(accountId, chatId)

      // Unarchive chat if it's been in archive and gets activated again
      if (chat.archived) {
        await BackendRemote.rpc.setChatVisibility(accountId, chatId, 'Normal')
      }

      selectChat(chatId)
    },
    [selectChat]
  )
}
