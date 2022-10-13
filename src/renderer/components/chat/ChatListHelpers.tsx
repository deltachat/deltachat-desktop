import { useState, useEffect, useMemo } from 'react'
import { ipcBackend } from '../../ipc'
import { getLogger } from '../../../shared/logger'
import { debounce } from 'debounce'
import { BackendRemote } from '../../backend-com'
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
          .then(setIds)
      }, 200),
    [chatId]
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

    window.__refetchChatlist = refetchChatlist
    ipcBackend.on('DC_EVENT_MSGS_CHANGED', refetchChatlist)
    ipcBackend.on('DC_EVENT_INCOMING_MSG', refetchChatlist)
    ipcBackend.on('DC_EVENT_CHAT_MODIFIED', refetchChatlist)
    debouncedGetChatListEntries(listFlags, queryStr, queryContactId)
    return () => {
      ipcBackend.removeListener('DC_EVENT_MSGS_CHANGED', refetchChatlist)
      ipcBackend.removeListener('DC_EVENT_INCOMING_MSG', refetchChatlist)
      ipcBackend.removeListener('DC_EVENT_CHAT_MODIFIED', refetchChatlist)
      window.__refetchChatlist = undefined
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
