import { useCallback } from 'react'

import { BackendRemote } from '../backend-com'
import { getLogger } from '../../shared/logger'
import useChat from './useChat'

const log = getLogger('renderer/hooks/useCreateChatByContactId')

export default function useCreateChatByContactId() {
  const { selectChat } = useChat()

  return useCallback(
    async (accountId: number, contactId: number) => {
      const chatId = await BackendRemote.rpc.createChatByContactId(
        accountId,
        contactId
      )

      const chat = await BackendRemote.rpc.getFullChatById(accountId, chatId)

      if (chat.archived) {
        log.debug('chat was archived, unarchiving it')
        await BackendRemote.rpc.setChatVisibility(accountId, chatId, 'Normal')
      }

      selectChat(accountId, chatId)
    },
    [selectChat]
  )
}
