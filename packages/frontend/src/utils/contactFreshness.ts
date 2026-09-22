import moment from 'moment'

import type { getMessageFunction } from '@deltachat-desktop/shared/localize'

/**
 * Describes how long ago a contact was last seen, to be shown below the
 * contact name for contacts with a `'Old'` freshness.
 *
 * @param lastSeen unix timestamp in seconds, 0 if the contact was never seen
 */
export function lastSeenLongAgoText(
  lastSeen: number,
  tx: getMessageFunction
): string {
  if (lastSeen <= 0) {
    return tx('never_seen')
  }

  return tx('last_seen_relative', moment(lastSeen * 1000).fromNow())
}
