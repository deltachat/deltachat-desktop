import { useCallback } from 'react'

import useChat from './useChat'
import {
  createChatByContactId,
  getChat,
  setChatVisibility,
} from '../backend/chat'

export default function useCreateChatByContactId() {
  const { selectChat } = useChat()

  return useCallback(
    async (accountId: number, contactId: number) => {
      const chatId = await createChatByContactId(accountId, contactId)
      const chat = await getChat(accountId, chatId)

      // Unarchive chat if it's been in archive and gets activated again
      if (chat.archived) {
        await setChatVisibility(accountId, chatId, 'Normal')
      }

      selectChat(accountId, chatId)
    },
    [selectChat]
  )
}
