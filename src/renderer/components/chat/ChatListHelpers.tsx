import { useState, useEffect, useMemo } from 'react'
import { ipcBackend } from '../../ipc'
import { getLogger } from '../../../shared/logger'
import { DeltaBackend } from '../../delta-remote'
import { debounce } from 'debounce'
import { BackendRemote } from '../../backend-com'

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
  if (window.__selectedAccountId === undefined) {
    throw new Error('no context selected')
  }
  const accountId = window.__selectedAccountId
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
      debouncedGetChatListEntries(listFlags, queryStr, queryContactId)
    }

    ipcBackend.on('DD_EVENT_CHATLIST_CHANGED', refetchChatlist)
    debouncedGetChatListEntries(listFlags, queryStr, queryContactId)
    return () => {
      ipcBackend.removeListener('DD_EVENT_CHATLIST_CHANGED', refetchChatlist)
    }
  }, [listFlags, queryStr, queryContactId, debouncedGetChatListEntries])

  return {
    chatListIds: chatListEntries,
    listFlags,
    setListFlags,
    queryStr,
    setQueryStr,
    queryContactId,
    setQueryContactId,
  }
}
