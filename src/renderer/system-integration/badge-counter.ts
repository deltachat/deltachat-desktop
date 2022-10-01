import { debounce } from 'debounce'
import { BackendRemote } from '../backend-com'
import { ipcBackend } from '../ipc'
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
  ipcBackend.on('DC_EVENT_INCOMING_MSG', async (_, [_chatId, _messageId]) => {
    debouncedUpdateBadgeCounter()
  })

  ipcBackend.on('DC_EVENT_CHAT_MODIFIED', async (_evt, [_chatId]) => {
    debouncedUpdateBadgeCounter()
  })
  // on app startup:
  debouncedUpdateBadgeCounter()
}
