import { useState, useEffect, useMemo } from 'react'
import { debounce } from 'debounce'

import { asyncThrottle } from '@deltachat-desktop/shared/async-throttle'

import { getLogger } from '../../../../shared/logger'
import { BackendRemote, onDCEvent } from '../../backend-com'
import { selectedAccountId } from '../../ScreenController'

const log = getLogger('renderer/helpers/ChatList')

export function debounceWithInit<ARGS extends Array<any>>(
  fn: (...args: ARGS) => void,
  delay_ms: number
): (...args: ARGS) => void {
  const dfn = debounce(fn, delay_ms)
  let first_run = true

  return (...args: ARGS) => {
    if (first_run) {
      first_run = false
      fn(...args)
    } else {
      dfn(...args)
    }
  }
}

export function useMessageResults(
  queryStr: string | undefined,
  chatId: number | null = null
) {
  const [ids, setIds] = useState<number[]>([])

  const debouncedSearchMessages = useMemo(
    () =>
      debounceWithInit((queryStr: string | undefined) => {
        BackendRemote.rpc
          .searchMessages(selectedAccountId(), queryStr || '', chatId)
          .then(ids => {
            if (chatId) {
              // in-chat search results need to be be ordered by newest first
              ids.reverse()
            }
            setIds(ids)
          })
      }, 200),
    [chatId]
  )

  useEffect(
    () => debouncedSearchMessages(queryStr),
    [queryStr, debouncedSearchMessages]
  )

  return ids
}

/**
 * The resulting `chatListEntries` is cached for the initial query parameters
 * (i.e. with default initial parameters that would be all chats).
 * The said cache is also updated on `ChatlistChanged` event.
 */
export function useChatList(
  initialListFlags: number | null = null,
  initialQueryStr?: string,
  initialQueryContactId?: number
) {
  if (window.__selectedAccountId === undefined) {
    throw new Error('no context selected')
  }
  const accountId = window.__selectedAccountId
  if (!initialQueryStr) initialQueryStr = ''

  const [listFlags, setListFlags] = useState(initialListFlags)
  const [queryStr, setQueryStr] = useState<string | undefined>(initialQueryStr)
  const [queryContactId, setQueryContactId] = useState(initialQueryContactId)
  const [chatListEntries, setChatListEntries] = useState<number[]>([])

  const areQueryParamsInitial: boolean =
    initialListFlags === listFlags &&
    initialQueryStr === queryStr &&
    initialQueryContactId === queryContactId
  const chatListEntriesForInitialQueryParams = useChatListNoDebounce(
    accountId,
    initialListFlags,
    initialQueryStr,
    initialQueryContactId
  )

  const debouncedGetChatListEntries = useMemo(
    () =>
      debounce(
        (
          listFlags: number | null,
          queryStr: string | undefined,
          queryContactId: number | undefined
        ) => {
          BackendRemote.rpc
            .getChatlistEntries(
              accountId,
              listFlags,
              queryStr || null,
              queryContactId || null
            )
            .then(setChatListEntries)
        },
        200
      ),
    [accountId]
  )

  useEffect(() => {
    log.debug(
      'useChatList: listFlags, queryStr or queryContactId changed, refetching chatlistids'
    )

    const refetchChatlist = () => {
      log.debug('useChatList: refetchingChatlist')

      if (areQueryParamsInitial) {
        // We don't need to fetch the chat list another time,
        // because it will be fetched with the same parameters
        // inside of `useChatListNoDebounce`,
        // and we'll return that from this hook.
        debouncedGetChatListEntries.clear()
      } else {
        debouncedGetChatListEntries(listFlags, queryStr, queryContactId)
      }
    }

    if (areQueryParamsInitial) {
      debouncedGetChatListEntries.clear()
    } else {
      debouncedGetChatListEntries(listFlags, queryStr, queryContactId)
    }

    return onDCEvent(accountId, 'ChatlistChanged', refetchChatlist)
  }, [
    listFlags,
    queryStr,
    queryContactId,
    debouncedGetChatListEntries,
    accountId,
    areQueryParamsInitial,
  ])

  if (areQueryParamsInitial) {
    log.debug(
      "useChatList: query params are initial, we'll use " +
        'the cached version of the chat list'
    )
  } else {
    log.debug(
      "useChatList: query params are non-initial, we'll use a " +
        'freshly fetched chat list'
    )
  }
  return {
    chatListIds: areQueryParamsInitial
      ? chatListEntriesForInitialQueryParams
      : chatListEntries,
    listFlags,
    setListFlags,
    queryStr,
    setQueryStr,
    queryContactId,
    setQueryContactId,
  }
}

/**
 * Despite the name, fetching is still debounced on ChatlistChanged events.
 * (but it's not debounced when the hook's arguments change).
 */
function useChatListNoDebounce(
  accountId: number,
  listFlags: number | null = null,
  queryStr: string = '',
  queryContactId?: number
) {
  const [chatListEntries, setChatListEntries] = useState<number[]>([])

  // Though perhaps a throttle would be more appropriate.
  const throttledFetchChatlist = useMemo(
    () =>
      asyncThrottle(
        (
          listFlags: number | null,
          queryStr: string,
          queryContactId: number | undefined
        ) => {
          log.debug('useChatListNoDebounce: fetching chat list')

          BackendRemote.rpc
            .getChatlistEntries(
              accountId,
              listFlags,
              queryStr || null,
              queryContactId || null
            )
            .then(setChatListEntries)
        },
        200
      ),
    [accountId]
  )

  useEffect(() => {
    throttledFetchChatlist(listFlags, queryStr, queryContactId)
    throttledFetchChatlist.flush()

    const throttledFetchChatlist2 = () => {
      throttledFetchChatlist(listFlags, queryStr, queryContactId)
    }
    return onDCEvent(accountId, 'ChatlistChanged', throttledFetchChatlist2)
  }, [accountId, listFlags, queryStr, queryContactId, throttledFetchChatlist])

  return chatListEntries
}
