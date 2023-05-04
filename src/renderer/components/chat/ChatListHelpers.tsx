import { useState, useEffect, useMemo } from 'react'
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

  useEffect(() => debouncedSearchMessages(queryStr), [
    queryStr,
    debouncedSearchMessages,
  ])

  return ids
}

export function useChatList(
  _listFlags: number | null = null,
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
  const [chatListEntries, setChatListEntries] = useState<number[]>([])

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
      debouncedGetChatListEntries(listFlags, queryStr, queryContactId)
    }

    window.__refetchChatlist = refetchChatlist
    const emitter = BackendRemote.getContextEvents(accountId)
    emitter.on('MsgsChanged', refetchChatlist)
    emitter.on('IncomingMsg', refetchChatlist)
    emitter.on('ChatModified', refetchChatlist)
    debouncedGetChatListEntries(listFlags, queryStr, queryContactId)
    return () => {
      emitter.off('MsgsChanged', refetchChatlist)
      emitter.off('IncomingMsg', refetchChatlist)
      emitter.off('ChatModified', refetchChatlist)
      window.__refetchChatlist = undefined
    }
  }, [
    listFlags,
    queryStr,
    queryContactId,
    debouncedGetChatListEntries,
    accountId,
  ])

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
