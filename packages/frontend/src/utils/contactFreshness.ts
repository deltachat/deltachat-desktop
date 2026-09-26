import moment from 'moment'
import { C } from '@deltachat/jsonrpc-client'

import type { T } from '@deltachat/jsonrpc-client'
import type { getMessageFunction } from '@deltachat-desktop/shared/localize'

/**
 * Status line shown below a contact's name.
 *
 * @param oldOnly if true, a last-seen text is only returned for contacts that
 * were not seen for a long time (freshness `'Old'`), as it is only relevant
 * there (e.g. in lists or the chat header)
 */
export function getContactStatusLine(
  contact: Pick<
    T.Contact,
    | 'id'
    | 'isBlocked'
    | 'isKeyContact'
    | 'address'
    | 'isBot'
    | 'freshness'
    | 'lastSeen'
  >,
  tx: getMessageFunction,
  oldOnly: boolean
): string | null {
  if (contact.id === C.DC_CONTACT_ID_SELF) {
    return null
  } else if (contact.isBlocked) {
    return tx('contact_blocked')
  } else if (!contact.isKeyContact) {
    return contact.address
  } else if (contact.isBot) {
    return tx('bot')
  } else if (contact.freshness === 'RecentlySeen') {
    return tx('seen_recently')
  } else if (oldOnly && contact.freshness !== 'Old') {
    return null
  }
  return lastSeenText(contact.lastSeen, tx)
}

/**
 * @param lastSeen unix timestamp in seconds, 0 if the contact was never seen
 */
function lastSeenText(lastSeen: number, tx: getMessageFunction): string {
  if (lastSeen <= 0) {
    return tx('never_seen')
  }

  const lastSeenMoment = moment(lastSeen * 1000)
  const age = Date.now() / 1000 - lastSeen
  const oneDay = 24 * 60 * 60
  const oneWeek = 7 * oneDay
  const oneMonth = 31 * oneDay
  const oneYear = 365 * oneDay

  if (lastSeenMoment.isSame(moment(), 'day')) {
    return tx('seen_today')
  }
  if (lastSeenMoment.isSame(moment().subtract(1, 'day'), 'day')) {
    return tx('seen_yesterday')
  }
  if (age < oneWeek) {
    return tx('seen_within_week')
  }
  if (age <= oneMonth) {
    return tx('seen_within_month')
  }
  if (age < oneYear) {
    const months = Math.floor(age / oneMonth)
    return tx('seen_n_months_ago', String(months), { quantity: months })
  }
  return tx('seen_long_ago')
}
