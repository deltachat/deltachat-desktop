import { useState, useEffect } from 'react'
import { ipcBackend } from '../../ipc'
import { getLogger } from '../../../shared/logger'
import { DeltaBackend } from '../../delta-remote'
import { C } from 'deltachat-node/dist/constants'
import { useDebounced } from '../helpers/useDebounced'

const log = getLogger('renderer/helpers/ChatList')

export function useMessageResults(queryStr: string, chatId = 0) {
  const [ids, setIds] = useState<number[]>([])

  const debouncedSearchMessages = useDebounced(
    (queryStr: string, chatId: number, cb: (value: number[]) => void) => {
      DeltaBackend.call('messageList.searchMessages', queryStr, chatId).then(cb)
    },
    200
  )

  const updateContacts = (queryStr: string, chatId = 0) =>
    debouncedSearchMessages(queryStr, chatId, setIds)

  useEffect(() => {
    DeltaBackend.call('messageList.searchMessages', queryStr, chatId).then(
      setIds
    )
  }, [])

  return [ids, updateContacts] as [number[], typeof updateContacts]
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

  const debouncedGetChatListEntries = useDebounced(
    (
      listFlags: number,
      queryStr: string,
      queryContactId: number,
      cb: (...args: any) => void
    ) => {
      DeltaBackend.call(
        'chatList.getChatListEntries',
        listFlags,
        queryStr,
        queryContactId
      ).then(cb)
    },
    200
  )

  const getAndSetChatListEntries = (immediatly = false) => {
    if (immediatly === true) {
      DeltaBackend.call(
        'chatList.getChatListEntries',
        listFlags,
        queryStr,
        queryContactId
      ).then(setChatListEntries)
      return
    }
    debouncedGetChatListEntries(
      listFlags,
      queryStr,
      queryContactId,
      setChatListEntries
    )
  }

  const refetchChatlist = () => {
    log.debug('useChatList: refetchingChatlist')
    getAndSetChatListEntries()
  }

  useEffect(() => {
    log.debug('useChatList: onComponentDidMount')
    const onMsgNotice = (_event: any, [chatId]: [number, number]) => {
      if (chatId === C.DC_CHAT_ID_DEADDROP) {
        refetchChatlist()
      }
    }

    ipcBackend.on('DD_EVENT_CHATLIST_CHANGED', refetchChatlist)
    ipcBackend.on('DC_EVENT_MSGS_NOTICED', onMsgNotice)
    return () => {
      ipcBackend.removeListener('DD_EVENT_CHATLIST_CHANGED', refetchChatlist)
      ipcBackend.removeListener('DC_EVENT_MSGS_NOTICED', onMsgNotice)
    }
  }, [listFlags, queryStr, queryContactId])

  useEffect(() => {
    log.debug(
      'useChatList: listFlags, queryStr or queryContactId changed, refetching chatlistids'
    )
    getAndSetChatListEntries()
  }, [listFlags, queryStr, queryContactId])

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
