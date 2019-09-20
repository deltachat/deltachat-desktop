import React, { useState, useEffect, useRef, useLayoutEffect } from 'react'
import { callDcMethod, callDcMethodAsync, ipcBackend } from '../../ipc'
import debounce from 'debounce'
import ChatListItem from './ChatListItem'
import logger from '../../../logger'
import { useDebouncedCallback } from 'use-debounce'

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

  const onChatListUpdated = () => {
    log.debug('useChatListIds: chatlist updated, refetching chatlistids')
    getAndSetChatListIds()
  }

  const onMsgsChanged = (ev, chatId, msgId) => {
    if (chatId === 0) {
      log.debug('useChatListIds: onMsgsChanged, chatId is zero, refetching chatlistids')
      getAndSetChatListIds()
    }
  }

  const refetchChatlist = () => {
    log.debug('useChatListIds: refetchingChatlist')
    getAndSetChatListIds()
  }

  useEffect(() => {
    log.debug('useChatListIds: onComponentDidMount')
    ipcBackend.on('DD_EVENT_CHATLIST_UPDATED', onChatListUpdated)
    ipcBackend.on('DC_EVENT_INCOMING_MSG', refetchChatlist)
    ipcBackend.on('DC_EVENT_MSGS_CHANGED', onMsgsChanged)
    return () => {
      ipcBackend.removeListener('DD_EVENT_CHATLIST_UPDATED', onChatListUpdated)
      ipcBackend.removeListener('DC_EVENT_MSGS_CHANGED', onMsgsChanged)
    }
  }, [])

  useEffect(() => {
    log.debug('useChatListIds: listFlags, queryStr or queryContactId changed, refetching chatlistids')
    getAndSetChatListIds()
  }, [listFlags, queryStr, queryContactId])

  return { chatListIds, listFlags, setListFlags, queryStr, setQueryStr, queryContactId, setQueryContactId }
}

export const useLazyChatListItems = (chatListIds) => {
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
    const itemHeight = scrollHeight / chatListIds.length
    const indexStart = Math.floor(scrollTop / itemHeight)
    const indexEnd = Math.floor(1 + indexStart + clientHeight / itemHeight)
    return [indexStart, indexEnd]
  }

  const chatIdsInView = () => {
    const [indexStart, indexEnd] = getIndexStartEndInView()
    const chatIds = []
    for (let i = indexStart; i <= indexEnd; i++) {
      const chatId = chatListIds[i]
      if (!chatId) break
      chatIds.push(chatId)
    }
    return chatIds
  }

  const [fetchChatsInView] = useDebouncedCallback(async () => {
    if (isNotReady()) return
    const chatIds = chatIdsInView()
    const chats = await fetchChats(chatIds)

    if (!chats) return
    log.debug('useLazyChatListItems: Fetched chats in view', Object.keys(chats))
    setChatItems(chatItems => { return { ...chatItems, ...chats } })
  }, 50)

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
    const chats = await callDcMethodAsync('getSmallChatByIds', [chatIds])
    fetching.current = fetching.current.filter(i => chatIdsToFetch.indexOf(i) === -1)
    return chats
  }

  useEffect(() => {
    log.debug('useLazyChatListItems: chatListIds changed, force updating chats in view')
    updateChatsInViewUnsetOthers()
  }, [chatListIds])

  useLayoutEffect(() => {
    if (Object.keys(chatItems).length > 0) return
    if (!scrollRef.current) return
    fetchChatsInView(scrollRef)
  }, [chatListIds])
  return [chatItems, fetchChatsInView, scrollRef]
}
