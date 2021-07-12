import { useState, useEffect, useMemo } from 'react'
import { ipcBackend } from '../../ipc'
import { getLogger } from '../../../shared/logger'
import { DeltaBackend } from '../../delta-remote'
import { C } from 'deltachat-node/dist/constants'
import { debounce } from 'debounce'

const log = getLogger('renderer/helpers/ChatList')

function debounceWithInit<ARGS extends Array<any>>(
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

export function useMessageResults(queryStr: string) {
  const [ids, setIds] = useState<number[]>([])

  const debouncedSearchMessages = useMemo(
    () =>
      debounceWithInit((queryStr: string) => {
        DeltaBackend.call('messageList.searchMessages', queryStr, 0).then(
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
  _listFlags?: number,
  _queryStr?: string,
  _queryContactId?: number
) {
  if (!_queryStr) _queryStr = ''

  const [listFlags, setListFlags] = useState(_listFlags)
  const [queryStr, setQueryStr] = useState(_queryStr)
  const [queryContactId, setQueryContactId] = useState(_queryContactId)
  const [chatListEntries, setChatListEntries] = useState<[number, number][]>([])

  const debouncedGetChatListEntries = useMemo(
    () =>
      debounce(
        (listFlags: number, queryStr: string, queryContactId: number) => {
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

  useEffect(() => {
    log.debug(
      'useChatList: listFlags, queryStr or queryContactId changed, refetching chatlistids'
    )

    const refetchChatlist = () => {
      log.debug('useChatList: refetchingChatlist')
      debouncedGetChatListEntries(listFlags, queryStr, queryContactId)
    }
    const onMsgNotice = (_event: any, [chatId]: [number, number]) => {
      if (chatId === C.DC_CHAT_ID_DEADDROP) {
        refetchChatlist()
      }
    }

    ipcBackend.on('DD_EVENT_CHATLIST_CHANGED', refetchChatlist)
    ipcBackend.on('DC_EVENT_MSGS_NOTICED', onMsgNotice)
    debouncedGetChatListEntries(listFlags, queryStr, queryContactId)
    return () => {
      ipcBackend.removeListener('DD_EVENT_CHATLIST_CHANGED', refetchChatlist)
      ipcBackend.removeListener('DC_EVENT_MSGS_NOTICED', onMsgNotice)
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
