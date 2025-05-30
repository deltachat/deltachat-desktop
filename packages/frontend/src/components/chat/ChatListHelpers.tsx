import { useState, useEffect, useMemo, useRef } from 'react'
import { getLogger } from '../../../../shared/logger'
import { debounce } from 'debounce'
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

  const initialListFlags = useRef(listFlags)
  const initialQueryStr = useRef(queryStr)
  const initialQueryContactId = useRef(queryContactId)
  const [chatListEntries, setChatListEntries] = useState<number[]>([])

  const areQueryParamsInitial: boolean =
    listFlags === initialListFlags.current &&
    queryStr === initialQueryStr.current &&
    queryContactId === initialQueryContactId.current
  const chatListEntriesForInitialQueryParams = useChatListNoDebounce(
    accountId,
    initialListFlags.current,
    initialQueryStr.current,
    initialQueryContactId.current
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
  const debouncedFetchChatlist = useMemo(
    () =>
      debounce(
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
    debouncedFetchChatlist(listFlags, queryStr, queryContactId)
    debouncedFetchChatlist.flush()

    const debouncedFetchChatlist2 = () => {
      debouncedFetchChatlist(listFlags, queryStr, queryContactId)
    }
    return onDCEvent(accountId, 'ChatlistChanged', debouncedFetchChatlist2)
  }, [accountId, listFlags, queryStr, queryContactId, debouncedFetchChatlist])

  return chatListEntries
}
