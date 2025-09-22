import { T } from '@deltachat/jsonrpc-client'
import { BackendRemote } from '../../../backend-com'
import { getLogger } from '@deltachat-desktop/shared/logger'

const log = getLogger('render/ChatAuditLog/util')

export async function loadContactsWithFallback(
  accountId: number,
  contactIds: T.U32[]
): Promise<Record<T.U32, T.Contact>> {
  try {
    return BackendRemote.rpc.getContactsByIds(accountId, contactIds)
  } catch (error) {
    log.error('loading all contacts failed, using fallback', error)
    // if the faster combined call does not work, then load contacts one by one
    // so only contact avatars with an error are not displayed
    try {
      const result: Record<T.U32, T.Contact> = {}
      for (const contactId of contactIds) {
        try {
          result[contactId] = await BackendRemote.rpc.getContact(
            accountId,
            contactId
          )
        } catch (error) {
          log.warn({ contactId, error })
        }
      }
      return result
    } catch (error) {
      log.error('fallback failed', error)
      return {}
    }
  }
}

export function uniqueFromIdsFromMessageResults(
  messages: Record<number, T.MessageLoadResult>
): number[] {
  const contactIds: number[] = []
  for (const key in messages) {
    if (Object.prototype.hasOwnProperty.call(messages, key)) {
      const message = messages[key]
      if (message.kind === 'message') {
        if (!contactIds.includes(message.fromId)) {
          contactIds.push(message.fromId)
        }
      }
    }
  }
  return contactIds
}
