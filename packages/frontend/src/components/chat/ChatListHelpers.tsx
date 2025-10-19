import { useState, useEffect, useMemo } from 'react'
import { getLogger } from '../../../../shared/logger'
import { debounce } from 'debounce'
import { BackendRemote, onDCEvent } from '../../backend-com'
import { selectedAccountId } from '../../ScreenController'
import { useFetch } from '../../hooks/useFetch'
import asyncThrottle from '@jcoreio/async-throttle'

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

export function useMessageResultIds(
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

  useEffect(() => {
    const accountId = window.__selectedAccountId
    if (!accountId) {
      return
    }
    const removeMessageDeletedListener = onDCEvent(
      accountId,
      'MsgDeleted',
      ({ msgId }) => {
        if (ids.includes(msgId)) {
          setIds(ids.filter(id => id !== msgId))
        }
      }
    )
    const removeChatChangedListener = onDCEvent(
      accountId,
      'ChatlistItemChanged',
      ({ chatId: eventChatId }) => {
        if (chatId != null && eventChatId !== chatId) {
          // if we search in a specific chat, but the
          // change event is for another chat
          return
        }
        if (queryStr && queryStr.length > 0) {
          // if a chatlist item changed, we need to re-fetch the messages
          // (chatlist items change if new messages arrive)
          debouncedSearchMessages(queryStr)
        }
      }
    )
    return () => {
      removeMessageDeletedListener()
      removeChatChangedListener()
    }
  }, [chatId, debouncedSearchMessages, ids, queryStr])

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
  listFlags: number | null = null,
  queryStr?: string,
  queryContactId?: number
) {
  if (window.__selectedAccountId === undefined) {
    throw new Error('no context selected')
  }
  const accountId = window.__selectedAccountId
  if (!queryStr) queryStr = ''

  const [initialListFlags] = useState(listFlags)
  const [initialQueryStr] = useState(queryStr)
  const [initialQueryContactId] = useState(queryContactId)

  const areQueryParamsInitial: boolean =
    listFlags === initialListFlags &&
    queryStr === initialQueryStr &&
    queryContactId === initialQueryContactId
  const chatListEntriesForInitialQueryParams = useChatListSimple(
    // Here let's never pass `null`, so that switching to the "default" view
    // is always up to date and switching back to it is instant.
    [accountId, initialListFlags, initialQueryStr, initialQueryContactId]
  )
  const chatListEntriesForNonInitialQueryParams = useChatListSimple(
    // When query params are initial, `chatListEntriesForNonInitialQueryParams`
    // is unused.
    areQueryParamsInitial
      ? null
      : [accountId, listFlags, queryStr, queryContactId]
  )
  // TODO remove the flashing of the lingering value
  // when `areQueryParamsInitial` changes.
  // For example, if you start a search, then cancel it,
  // and then open the "archive" folder,
  // we would flash the previous search results for a moment.

  if (areQueryParamsInitial) {
    log.debug(
      "useChatList: query params are initial, we'll use " +
        'the cached version of the chat list'
    )
    return chatListEntriesForInitialQueryParams
  } else {
    log.debug(
      "useChatList: query params are non-initial, we'll use a " +
        'freshly fetched chat list'
    )
    return chatListEntriesForNonInitialQueryParams
  }
}

function useChatListSimple(
  /**
   * When `null`, this hook returns `[]` and doesn't perform any fetches.
   */
  args:
    | null
    | [
        accountId: number,
        listFlags?: number | null,
        queryStr?: string,
        queryContactId?: number,
      ]
) {
  const accountId = args ? args[0] : null

  const chatListFetch = useFetch(
    useMemo(
      () =>
        asyncThrottle(
          (
            ...args: Parameters<typeof BackendRemote.rpc.getChatlistEntries>
          ) => {
            log.debug('useChatList: fetching chatlist')
            return BackendRemote.rpc.getChatlistEntries(...args)
          },
          200
        ),
      []
    ),
    args == null
      ? null
      : [
          args[0], // accountId
          args[1] ?? null, // listFlags
          args[2] || null, // queryStr
          args[3] ?? null, // queryContactId
        ]
  )
  const refreshChatlist = chatListFetch?.refresh
  useEffect(() => {
    if (accountId == undefined || refreshChatlist == undefined) {
      return
    }
    return onDCEvent(accountId, 'ChatlistChanged', () => {
      log.debug('useChatList: ChatlistChanged, will refetch chatlist')
      refreshChatlist()
    })
  }, [accountId, refreshChatlist])

  if (chatListFetch?.result?.ok === false) {
    log.error(
      'useChatList: getChatlistEntries failed:',
      chatListFetch.result.err
    )
  }

  return {
    chatListIds: chatListFetch?.lingeringResult?.ok
      ? chatListFetch?.lingeringResult.value
      : [],
    chatListFetch,
  }
}
