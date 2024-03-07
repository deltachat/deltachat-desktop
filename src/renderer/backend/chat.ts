import { BackendRemote } from '../backend-com'
import { debouncedUpdateBadgeCounter } from '../system-integration/badge-counter'
import { clearNotificationsForChat } from '../system-integration/notifications'

import type { T } from '@deltachat/jsonrpc-client'

export async function getChat(
  accountId: number,
  chatId: number
): Promise<T.FullChat> {
  return await BackendRemote.rpc.getFullChatById(accountId, chatId)
}

export async function saveLastChatId(accountId: number, chatId: number) {
  await BackendRemote.rpc.setConfig(accountId, 'ui.lastchatid', `${chatId}`)
}

export async function muteChat(
  accountId: number,
  chatId: number,
  duration: T.MuteDuration
) {
  await BackendRemote.rpc.setChatMuteDuration(accountId, chatId, duration)
}

export async function unmuteChat(accountId: number, chatId: number) {
  await BackendRemote.rpc.setChatMuteDuration(accountId, chatId, {
    kind: 'NotMuted',
  })
}

export function markChatAsSeen(accountId: number, chatId: number) {
  // Mark all messages in chat as "seen" in core backend
  BackendRemote.rpc.marknoticedChat(accountId, chatId)
  debouncedUpdateBadgeCounter()

  // Remove potential system notifications for this chat
  clearNotificationsForChat(accountId, chatId)
}
