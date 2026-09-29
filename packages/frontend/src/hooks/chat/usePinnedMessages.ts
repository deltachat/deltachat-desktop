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
 * newjust pinned message. Otherwise it keeps showing the same message
 * as long as that is still pinned or falls back to the newest one.
 */
function applyPinnedIds(
  prev: PinnedMessagesState,
  pinnedIds: T.Message['id'][]
): PinnedMessagesState {
  const newestNewlyPinned = pinnedIds.findLast(
    id => !prev.pinnedIds.includes(id)
  )
  let shownId: T.Message['id'] | null
  if (newestNewlyPinned !== undefined) {
    shownId = newestNewlyPinned
  } else if (prev.shownId !== null && pinnedIds.includes(prev.shownId)) {
    shownId = prev.shownId
  } else {
    shownId = pinnedIds.at(-1) ?? null
  }
  return { pinnedIds, shownId }
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
      try {
        const pinnedIds = await BackendRemote.rpc.getPinnedMessages(
          accountId,
          chatId
        )
        if (!cancelled) {
          setState(prev => applyPinnedIds(prev, pinnedIds))
        }
      } catch (error) {
        log.error('failed to load pinned messages', error)
      }
    }, 100)

    load()
    const cleanups = [
      // Emitted by core on pinning and unpinning, locally and remotely.
      onDCEvent(accountId, 'MsgsChanged', ({ chatId: eventChatId }) => {
        if (eventChatId === chatId || eventChatId === 0) {
          load()
        }
      }),
      onDCEvent(accountId, 'MsgDeleted', ({ chatId: eventChatId }) => {
        if (eventChatId === chatId) {
          load()
        }
      }),
    ]
    return () => {
      cancelled = true
      cleanups.forEach(cleanup => cleanup())
    }
  }, [accountId, chatId])

  const showNext = useCallback(() => setState(selectNextPinned), [])

  return {
    pinnedIds: state.pinnedIds,
    shownId: state.shownId,
    showNext,
  }
}
