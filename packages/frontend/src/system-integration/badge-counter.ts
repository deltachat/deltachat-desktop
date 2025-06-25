import { throttle } from '@deltachat-desktop/shared/util'
import { BackendRemote } from '../backend-com'
import { runtime } from '@deltachat-desktop/runtime-interface'
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

  if (!(await runtime.getDesktopSettings()).syncAllAccounts) {
    if (window.__selectedAccountId) {
      combined_count = (
        await BackendRemote.rpc.getFreshMsgs(window.__selectedAccountId)
      ).length
    }
  }

  runtime.setBadgeCounter(combined_count)
}

export const throttledUpdateBadgeCounter = throttle(updateBadgeCounter, 500)

export function initBadgeCounter() {
  // FYI we have 3 places where we watch the number of unread messages:
  // - App's badge counter
  // - Per-account badge counter in accounts list
  // - useUnreadCount
  // Make sure to update all the places if you update one of them.
  BackendRemote.on('IncomingMsg', _ => {
    throttledUpdateBadgeCounter()
  })
  BackendRemote.on('ChatlistChanged', _ => {
    throttledUpdateBadgeCounter()
  })
  BackendRemote.on('MsgsNoticed', _ => {
    throttledUpdateBadgeCounter()
  })
  BackendRemote.on('ChatModified', _ => {
    throttledUpdateBadgeCounter()
  })
  // on app startup:
  throttledUpdateBadgeCounter()
}
