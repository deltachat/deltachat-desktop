import { useCallback, useEffect } from 'react'

import SettingsStoreInstance from '../stores/settings'
import useChat from './useChat'
import useHasChanged from './useHasChanged'
import { BackendRemote } from '../backend-com'

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
      await SettingsStoreInstance.effect.load()
      const lastChatId =
        SettingsStoreInstance.getState()?.settings['ui.lastchatid']

      if (lastChatId) {
        await selectChat(Number(lastChatId))
      }
    }
  }, [accountId, selectChat])

  useEffect(() => {
    if (hasAccountIdChanged) {
      selectLastChat()
    }
  }, [hasAccountIdChanged, selectLastChat])
}
