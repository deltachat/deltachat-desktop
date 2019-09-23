import React, { useState, useEffect, useRef, useLayoutEffect } from 'react'
import { callDcMethod, callDcMethodAsync, ipcBackend } from '../../ipc'
import debounce from 'debounce'
import ChatListItem from './ChatListItem'
import logger from '../../../logger'

const log = logger.getLogger('renderer/helpers/ChatList')

const debouncedGetChatListIds = debounce((listFlags, queryStr, queryContactId, cb) => {
  callDcMethod('getChatListIds', [listFlags, queryStr, queryContactId], cb)
}, 200)

export function useChatListIds (_listFlags, _queryStr, _queryContactId) {
  if (!_queryStr) _queryStr = ''

  const [listFlags, setListFlags] = useState(_listFlags)
  const [queryStr, setQueryStr] = useState(_queryStr)
  const [queryContactId, setQueryContactId] = useState(_queryContactId)
  const [chatListIds, setChatListIds] = useState([])

  const getAndSetChatListIds = immediatly => {
    if (immediatly === true) {
      callDcMethod('getChatListIds', [listFlags, queryStr, queryContactId], setChatListIds)
      return
    }
    debouncedGetChatListIds(listFlags, queryStr, queryContactId, setChatListIds)
  }

  const refetchChatlist = () => {
    log.debug('useChatListIds: refetchingChatlist')
    getAndSetChatListIds()
  }

  useEffect(() => {
    log.debug('useChatListIds: onComponentDidMount')
    ipcBackend.on('DD_EVENT_CHATLIST_CHANGED', refetchChatlist)
    return () => {
      ipcBackend.removeListener('DD_EVENT_CHATLIST_CHANGED', refetchChatlist)
    }
  }, [listFlags, queryStr, queryContactId])

  useEffect(() => {
    log.debug('useChatListIds: listFlags, queryStr or queryContactId changed, refetching chatlistids')
    getAndSetChatListIds()
  }, [listFlags, queryStr, queryContactId])

  return { chatListIds, listFlags, setListFlags, queryStr, setQueryStr, queryContactId, setQueryContactId }
}

export const useLazyChatListItems = chatListIds => {
  const scrollRef = useRef(null)
  const fetching = useRef([])
  const [chatItems, setChatItems] = useState({})

  const isNotReady = () => {
    if (chatListIds.length === 0) return true
    if (!scrollRef.current) {
      log.warn('scrollRef is undefined')
      return true
    }
    return false
  }

  const getIndexStartEndInView = () => {
    const { scrollHeight, scrollTop, clientHeight } = scrollRef.current
    // console.log('useLazyChatListItems: getIndexStartEndInView', scrollRef, scrollHeight, scrollTop, clientHeight, chatListIds.length)
    const itemHeight = scrollHeight / chatListIds.length
    const indexStart = Math.floor(scrollTop / itemHeight)
    const indexEnd = Math.floor(1 + indexStart + clientHeight / itemHeight)
    // console.log('useLazyChatListItems: getIndexStartEndInView indexStart indexEnd', indexStart, indexEnd)
    return [indexStart, indexEnd]
  }

  const chatIdsInView = (offset) => {
    let [indexStart, indexEnd] = getIndexStartEndInView()
    if (offset) {
      indexStart = indexStart - offset
      if (indexStart < 0) indexStart = 0
      indexEnd = indexEnd + offset
      if (indexEnd > chatListIds.length - 1) indexEnd = chatListIds.length - 1
    }
    const chatIds = []
    for (let i = indexStart; i <= indexEnd; i++) {
      const chatId = chatListIds[i]
      if (!chatId) break
      chatIds.push(chatId)
    }
    // log.debug('useLazyChatListItems: chatIdsInView', chatIds)
    return chatIds
  }

  const isChatIdInView = chatId => chatIdsInView().indexOf(chatId) !== -1

  const fetchChatsInView = async () => {
    if (isNotReady()) return
    const chatIds = chatIdsInView()
    const chats = await fetchChats(chatIds)

    if (!chats) return
    log.debug('useLazyChatListItems: Fetched chats in view', Object.keys(chats))
    setChatItems(chatItems => { return { ...chatItems, ...chats } })
  }

  const updateChatsInViewUnsetOthers = async () => {
    if (isNotReady()) return
    const chatIds = chatIdsInView()
    const chats = await fetchChats(chatIds, true)

    if (!chats) return
    log.debug('useLazyChatListItems: Force updating chats in view, unsetting others', Object.keys(chats))
    setChatItems(chats)
  }

  const fetchChats = async (chatIds, force) => {
    const chatIdsToFetch = chatIds.filter(i => fetching.current.indexOf(i) === -1 && (typeof chatItems[i] === 'undefined' || force === true))
    if (chatIdsToFetch.length === 0) return
    fetching.current.push(...chatIdsToFetch)
    const chats = await callDcMethodAsync('getSmallChatByIds', [chatIdsToFetch])
    fetching.current = fetching.current.filter(i => chatIdsToFetch.indexOf(i) === -1)
    return chats
  }

  const refetchChatIfInViewUnsetOtherwise = async (chatId) => {
    if (chatId === 0) return
    if (isChatIdInView(chatId)) {
      log.debug(`useLazyChatListItems: chat with id ${chatId} changed, it's in view therefore refetching`)
      const chats = await fetchChats([chatId], true)
      setChatItems(chatItems => { return { ...chatItems, ...chats } })
    } else {
      log.debug(`useLazyChatListItems: chat with id ${chatId} changed, it's NOT in view, unsetting if needed`)
      setChatItems(chatItems => {
        if (typeof chatItems[chatId] !== undefined) return { ...chatItems, [chatId]: undefined }
      }
      )
    }
  }

  const onChatListScroll = () => {
    fetchChatsInView()
  }

  const onChatListItemChanged = (event, { chatId }) => {
    if (chatId === 0) {
      updateChatsInViewUnsetOthers()
    } else {
      refetchChatIfInViewUnsetOtherwise(chatId)
    }
  }

  useEffect(() => {
    log.debug('useLazyChatListItems: onComponentDidMount')
    ipcBackend.on('DD_EVENT_CHATLIST_ITEM_CHANGED', onChatListItemChanged)
    return () => {
      ipcBackend.removeListener('DD_EVENT_CHATLIST_ITEM_CHANGED', onChatListItemChanged)
    }
  }, [chatListIds])

  useEffect(() => {
    log.debug('useLazyChatListItems: chatListIds changed, updating chats in view')
    fetchChatsInView()
  }, [chatListIds])

  useEffect(() => {
    if (Object.keys(chatItems).length > 0) return
    if (!scrollRef.current) return
    fetchChatsInView(scrollRef)
  }, [chatListIds, scrollRef])
  return { chatItems, onChatListScroll, scrollRef }
}
