import { useCallback, useEffect } from 'react'

import useChat from './useChat'
import useHasChanged from './useHasChanged'
import { BackendRemote } from '../backend-com'
import { getLastChatId } from '../backend/chat'

/**
 * Detects account changes and selects last known, selected chat for the user
 * for this account.
 */
export default function useSelectLastChat(accountId?: number) {
  const hasAccountIdChanged = useHasChanged(accountId)
  const { selectChat } = useChat()

  const selectLastChat = useCallback(async () => {
    if (!accountId) {
      return
    }

    const account = await BackendRemote.rpc.getAccountInfo(accountId)

    if (account.kind === 'Configured') {
      const lastChatId = await getLastChatId(accountId)
      if (lastChatId) {
        await selectChat(lastChatId)
      }
    }
  }, [accountId, selectChat])

  useEffect(() => {
    if (hasAccountIdChanged) {
      selectLastChat()
    }
  }, [hasAccountIdChanged, selectLastChat])
}
