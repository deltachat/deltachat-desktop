import moment from 'moment'

/**
 * IDs of the messages that begin a new day,
 * i.e. the ones that get a `DayMarker` rendered above them.
 *
 * Derived from the `timestamp` column the message list is ordered by, and not
 * from `Message.sortTimestamp`, which falls back to the sent time for messages
 * with `timestamp === 0` and would put them on a day they are not sorted by.
 *
 * Those messages, the info messages at the start of a chat, get no marker:
 * it would read "January 1, 1970".
 *
 * The timestamps come with the ids, so a marker can be rendered above a message
 * whose content is still loading, and `prevTimestamp` classifies the topmost
 * message of the window without having to load its predecessor.
 *
 * @param prevTimestamp timestamp of the message just before the window,
 * `undefined` if the window starts at the oldest message of the chat.
 */
export function getDayStartMessageIds(
  loadedMessageIds: number[],
  loadedTimestamps: { [msgId: number]: number },
  prevTimestamp: number | undefined
): Set<number> {
  const dayOf = (timestamp: number | undefined): number | undefined =>
    timestamp != undefined
      ? moment.unix(timestamp).startOf('day').valueOf()
      : undefined

  const ids = new Set<number>()
  let previousDay = dayOf(prevTimestamp)

  for (let i = 0; i < loadedMessageIds.length; i++) {
    const msgId = loadedMessageIds[i]
    const timestamp = loadedTimestamps[msgId]
    const day = dayOf(timestamp)
    if (day == undefined) {
      previousDay = undefined
      continue
    }
    // The oldest message of the chat starts a day in any case:
    // there is no predecessor it could share one with.
    const isFirstMessageOfChat = i === 0 && prevTimestamp == undefined
    if (
      timestamp !== 0 &&
      (isFirstMessageOfChat ||
        (previousDay != undefined && day !== previousDay))
    ) {
      ids.add(msgId)
    }
    previousDay = day
  }
  return ids
}
