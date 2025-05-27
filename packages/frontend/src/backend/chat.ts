import { BackendRemote } from '../backend-com'
import { clearNotificationsForChat } from '../system-integration/notifications'

import { C, type T } from '@deltachat/jsonrpc-client'

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

export async function getLastChatId(accountId: number): Promise<number | null> {
  const chatId = await BackendRemote.rpc.getConfig(accountId, 'ui.lastchatid')

  if (typeof chatId === 'string') {
    return parseInt(chatId, 10)
  }

  return null
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

  // We could `debouncedUpdateBadgeCounter()` here,
  // but it's not necessary, because we listen for `MsgsNoticed` anyway,
  // and this function doesn't actually always affect
  // the badge counter, e.g. when all messages in the chat are already noticed.

  // Remove potential system notifications for this chat
  clearNotificationsForChat(accountId, chatId)
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

/**
 * Helper method to determine the chat id of the "Device Messages" read-only chat.
 *
 * Note that there's currently no API to retrieve this id from the backend, this
 * is why we're iterating over all currently available chats instead.
 */
export async function getDeviceChatId(
  accountId: number
): Promise<number | null> {
  // This assumes that the chat with `C.DC_CONTACT_ID_DEVICE`
  // is actually a one-to-one chat.
  const chatId = await BackendRemote.rpc.getChatIdByContactId(
    accountId,
    C.DC_CONTACT_ID_DEVICE
  )

  return chatId
}
