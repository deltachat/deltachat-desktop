import { debounce } from 'debounce'
import { BackendRemote } from '../backend-com'
import { runtime } from '../runtime'

async function updateBadgeCounter() {
  const selectedAccountId = window.__selectedAccountId
  if (selectedAccountId === undefined) {
    runtime.setBadgeCounter(0)
  } else {
    const count = (await BackendRemote.rpc.getFreshMsgs(selectedAccountId))
      .length
    runtime.setBadgeCounter(count)
  }
}

export const debouncedUpdateBadgeCounter = debounce(
  updateBadgeCounter,
  333,
  false
)

export function initBadgeCounter() {
  BackendRemote.on('IncomingMsg', accountId => {
    if (accountId === window.__selectedAccountId) debouncedUpdateBadgeCounter()
  })
  BackendRemote.on('ChatModified', accountId => {
    if (accountId === window.__selectedAccountId) debouncedUpdateBadgeCounter()
  })
  // on app startup:
  debouncedUpdateBadgeCounter()
}
