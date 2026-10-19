import { useCallback, useEffect, useState } from 'react'
import asyncThrottle from '@jcoreio/async-throttle'
import { T } from '@deltachat/jsonrpc-client'

import { BackendRemote, onDCEvent } from '../../backend-com'
import { getLogger } from '@deltachat-desktop/shared/logger'

const log = getLogger('renderer/hooks/usePinnedMessages')

type PinnedMessagesState = {
  /** Ordered like the message list: oldest first. */
  pinnedIds: T.Message['id'][]
  shownId: T.Message['id'] | null
}

/**
 * Initially and whenever a message gets pinned, the banner shows the
 * new just pinned message. Otherwise it keeps showing the same message
 * as long as that is still pinned or falls back to the newest one.
 */
function getNextShownId(
  prev: PinnedMessagesState,
  pinnedIds: T.Message['id'][]
): PinnedMessagesState['shownId'] {
  const newestNewlyPinned = pinnedIds.findLast(
    id => !prev.pinnedIds.includes(id)
  )
  if (newestNewlyPinned !== undefined) {
    return newestNewlyPinned
  } else if (prev.shownId !== null && pinnedIds.includes(prev.shownId)) {
    return prev.shownId
  } else {
    return pinnedIds.at(-1) ?? null
  }
}

/**
 * Moves on to the next older pinned message,
 * jumps back to the newest if no older exists
 */
function selectNextPinned(prev: PinnedMessagesState): PinnedMessagesState {
  if (prev.pinnedIds.length === 0) {
    return prev
  }
  const index =
    prev.shownId === null ? -1 : prev.pinnedIds.indexOf(prev.shownId)
  const nextIndex = index <= 0 ? prev.pinnedIds.length - 1 : index - 1
  return { ...prev, shownId: prev.pinnedIds[nextIndex] ?? null }
}

export default function usePinnedMessages(accountId: number, chatId: number) {
  const [state, setState] = useState<PinnedMessagesState>({
    pinnedIds: [],
    shownId: null,
  })

  useEffect(() => {
    let cancelled = false
    // Make sure older results from previous loads
    // can't overwrite a newer one.
    const load = asyncThrottle(async () => {
      let pinnedIds: T.Message['id'][]
      try {
        pinnedIds = await BackendRemote.rpc.getPinnedMessages(accountId, chatId)
      } catch (error) {
        log.error('failed to load pinned messages', error)
        return
      }
      if (!cancelled) {
        setState(prev => ({
          shownId: getNextShownId(prev, pinnedIds),
          pinnedIds,
        }))
      }
    }, 100)

    load()
    const cleanup = onDCEvent(
      accountId,
      'PinnedMessagesChanged',
      ({ chatId: eventChatId }) => {
        if (eventChatId === chatId) {
          load()
        }
      }
    )
    return () => {
      cancelled = true
      cleanup()
    }
  }, [accountId, chatId])

  const showNext = useCallback(() => setState(selectNextPinned), [])

  return {
    pinnedIds: state.pinnedIds,
    shownId: state.shownId,
    showNext,
  }
}
