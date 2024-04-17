import { debounce } from 'debounce'
import { BackendRemote } from '../apiService'
import { RuntimeService } from '../runtime/runtimeService'
import AccountNotificationStoreInstance from '../stores/accountNotifications'

async function updateBadgeCounter() {
  const accountIds = await BackendRemote.rpc.getAllAccountIds()

  let combined_count = (
    await Promise.all(
      accountIds.map(async accountId =>
        !AccountNotificationStoreInstance.isAccountMuted(accountId)
          ? (await BackendRemote.rpc.getFreshMsgs(accountId)).length
          : 0
      )
    )
  ).reduce((previous, current) => previous + current, 0)

  if (!(await RuntimeService.getDesktopSettings()).syncAllAccounts) {
    if (window.__selectedAccountId) {
      combined_count = (
        await BackendRemote.rpc.getFreshMsgs(window.__selectedAccountId)
      ).length
    }
  }

  RuntimeService.setBadgeCounter(combined_count)
}

export const debouncedUpdateBadgeCounter = debounce(
  updateBadgeCounter,
  333,
  false
)

export function initBadgeCounter() {
  BackendRemote.on('IncomingMsg', _ => {
    debouncedUpdateBadgeCounter()
  })
  BackendRemote.on('ChatModified', _ => {
    debouncedUpdateBadgeCounter()
  })
  // on app startup:
  debouncedUpdateBadgeCounter()
}
