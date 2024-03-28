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

/**
 * Finds basic info, like contact id and the related chat ID of a contact based
 * on it's email address.
 *
 * The contact id can be null if this email address is unknown. If no chat
 * exists yet with this contact the chat id will be null as well.
 */
export async function getChatInfoByEmail(
  accountId: number,
  email: string
): Promise<{
  chatId: number | null
  contactId: number | null
}> {
  const contactId = await BackendRemote.rpc.lookupContactIdByAddr(
    accountId,
    email
  )

  const chatId = contactId
    ? await BackendRemote.rpc.getChatIdByContactId(accountId, contactId)
    : null

  return {
    contactId,
    chatId,
  }
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

export async function setChatVisibility(
  accountId: number,
  chatId: number,
  visibility: T.ChatVisibility
) {
  await BackendRemote.rpc.setChatVisibility(accountId, chatId, visibility)
}

export async function createChatByContactId(
  accountId: number,
  contactId: number | null,
  email?: string
): Promise<number> {
  // Create contact first with given email address if it doesn't exist yet
  if (!contactId) {
    if (!email) {
      throw new Error('either contactId or email needs to be set')
    }

    contactId = await BackendRemote.rpc.createContact(accountId, email, null)
  }

  return await BackendRemote.rpc.createChatByContactId(accountId, contactId)
}

/**
 * Returns true if all contacts of a given list are verified, otherwise false.
 */
export async function areAllContactsVerified(
  accountId: number,
  contactIds: number[]
): Promise<boolean> {
  const contacts = await BackendRemote.rpc.getContactsByIds(
    accountId,
    contactIds
  )

  return !contactIds.some(contactId => {
    return !contacts[contactId].isVerified
  })
}
