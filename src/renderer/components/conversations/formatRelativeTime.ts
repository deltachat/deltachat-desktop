import { DateTime } from 'luxon'

import type { getMessageFunction } from '../../../shared/localize'

export default function formatRelativeTime(
  rawTimestamp: number,
  options: { extended: boolean }
) {
  /* extended is how to display it in messages, so still rather short */
  const { extended } = options
  const tx = window.static_translate
  const timestamp = DateTime.fromMillis(rawTimestamp)
  const now = DateTime.now()
  const diff = DateTime.now().diff(timestamp).shiftToAll()

  if (diff.years >= 1 || now.year !== timestamp.year) {
    return extended
      ? timestamp.toLocaleString({
          ...DateTime.DATETIME_SHORT,
        }) /*10/14/1983, 1:30 PM*/
      : timestamp.toLocaleString(DateTime.DATE_SHORT) /* 10/14/1983 */
  } else if (diff.months >= 1 || diff.weeks >= 1 || diff.days >= 6) {
    return extended
      ? timestamp.toLocaleString({
          ...DateTime.TIME_SIMPLE,
          ...DateTime.DATE_FULL,
          year: undefined,
        }) /* June 1 at 5:56 PM */
      : timestamp.toLocaleString({
          ...DateTime.DATE_FULL,
          year: undefined,
          weekday: 'short',
          month: 'short',
        }) /* Jun 1 */
  } else if (diff.days >= 1 || now.ordinal !== timestamp.ordinal) {
    return extended
      ? timestamp.toLocaleString({
          ...DateTime.TIME_SIMPLE,
          weekday: 'short',
        }) /* Saturday, 5:51 PM */
      : timestamp.toLocaleString({
          ...DateTime.TIME_SIMPLE,
          weekday: 'short',
        }) /* Sat 5:51 PM */
  } else {
    timestamp.toRelative()
  }

  return tx('now')
}

export const FULL_HUMAN_DATE_TIME: Intl.DateTimeFormatOptions = {
  ...DateTime.DATETIME_HUGE,
  timeZoneName: undefined,
}

export function DayMarkerLabel(tx: getMessageFunction, timestamp: DateTime) {
  const now = DateTime.now()
  const diff = DateTime.now().diff(timestamp).shiftToAll()

  if (diff.days <= 1 && now.ordinal === timestamp.ordinal) {
    return tx('today')
  } else if (now.ordinal === timestamp.ordinal - 1) {
    return tx('yesterday')
  } else if (now.year === timestamp.year) {
    return timestamp.toLocaleString({
      ...DateTime.DATE_FULL,
      year: undefined,
      weekday: 'long',
    })
  } else {
    return timestamp.toLocaleString({ ...DateTime.DATE_FULL, weekday: 'long' })
  }
}
