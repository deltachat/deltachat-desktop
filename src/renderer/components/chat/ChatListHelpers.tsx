import { useState, useEffect, useMemo, useCallback } from 'react'
import { ipcBackend } from '../../ipc'
import { getLogger } from '../../../shared/logger'
import { DeltaBackend } from '../../delta-remote'
import { debounce } from 'debounce'

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

export function useMessageResults(queryStr: string | undefined) {
  const [ids, setIds] = useState<number[]>([])

  const debouncedSearchMessages = useMemo(
    () =>
      debounceWithInit((queryStr: string | undefined) => {
        DeltaBackend.call('messageList.searchMessages', queryStr || '', 0).then(
          setIds
        )
      }, 200),
    []
  )

  useEffect(() => debouncedSearchMessages(queryStr), [
    queryStr,
    debouncedSearchMessages,
  ])

  return ids
}

export function useChatList(
  _listFlags = 0,
  _queryStr?: string,
  _queryContactId?: number
) {
  if (!_queryStr) _queryStr = ''

  const [listFlags, setListFlags] = useState(_listFlags)
  const [queryStr, setQueryStr] = useState<string | undefined>(_queryStr)
  const [queryContactId, setQueryContactId] = useState(_queryContactId)
  const [chatListEntries, setChatListEntries] = useState<[number, number][]>([])

  const debouncedGetChatListEntries = useMemo(
    () =>
      debounce(
        (
          listFlags: number,
          queryStr: string | undefined,
          queryContactId: number | undefined
        ) => {
          DeltaBackend.call(
            'chatList.getChatListEntries',
            listFlags,
            queryStr,
            queryContactId
          ).then(setChatListEntries)
        },
        200
      ),
    []
  )

  const refresh = useCallback(() => {
    log.debug(
      'useChatList: listFlags, queryStr or queryContactId changed, refetching chatlistids'
    )

      log.debug('useChatList: refetchingChatlist')
      debouncedGetChatListEntries(listFlags, queryStr, queryContactId)

    debouncedGetChatListEntries(listFlags, queryStr, queryContactId)
  }, [debouncedGetChatListEntries, listFlags, queryContactId, queryStr])

  useEffect(() => {
    ipcBackend.on('DD_EVENT_CHATLIST_CHANGED', refresh)
    return () => {
      ipcBackend.removeListener('DD_EVENT_CHATLIST_CHANGED', refresh)
    }
  }, [refresh])

  return {
    chatListIds: chatListEntries,
    listFlags,
    setListFlags,
    queryStr,
    setQueryStr,
    queryContactId,
    setQueryContactId,
    refresh
  }
}
