import { useCallback, useContext, useEffect } from 'react'

import useChat from './useChat'
import { useHasChanged } from '../useHasChanged'
import { BackendRemote } from '../../backend-com'
import { getLastChatId } from '../../backend/chat'
import { ScreenContext } from '../../contexts/ScreenContext'

/**
 * Detects account changes and selects last known, selected chat for the user
 * for this account.
 */
export default function useSelectLastChat(accountId?: number) {
  const { smallScreenMode } = useContext(ScreenContext)
  const hasAccountIdChanged = useHasChanged(accountId)
  const hasSmallScreenModeChanged = useHasChanged(smallScreenMode)
  const { selectChat, chatId } = useChat()

  const smallScreenModeChatListVisible = !chatId

  const selectLastChat = useCallback(async () => {
    if (!accountId) {
      return
    }

    const account = await BackendRemote.rpc.getAccountInfo(accountId)

    if (account.kind === 'Configured') {
      const lastChatId = await getLastChatId(accountId)
      if (lastChatId && !smallScreenMode) {
        await selectChat(accountId, lastChatId)
      }
    }
  }, [accountId, selectChat, smallScreenMode])

  useEffect(() => {
    if (
      hasAccountIdChanged ||
      (hasSmallScreenModeChanged &&
        !smallScreenMode &&
        smallScreenModeChatListVisible) /* if small screen mode changed to false and it was not inside of a chat or global gallery */
    ) {
      selectLastChat()
    }
  }, [
    hasAccountIdChanged,
    hasSmallScreenModeChanged,
    smallScreenModeChatListVisible,
    smallScreenMode,
    selectLastChat,
  ])
}
