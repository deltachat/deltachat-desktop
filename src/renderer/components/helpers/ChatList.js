import React, { useState, useEffect, useRef, useLayoutEffect } from 'react'
import { callDcMethod, ipcBackend } from '../../ipc'
import debounce from 'debounce'
import ChatListItem from '../ChatListItem'

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

  const onChatListUpdated = () => getAndSetChatListIds()

  useEffect(() => {
    getAndSetChatListIds(true)
    ipcBackend.on('DD_EVENT_CHATLIST_UPDATED', onChatListUpdated)
    return () => ipcBackend.removeListener('DD_EVENT_CHATLIST_UPDATED', onChatListUpdated)
  }, [])

  useEffect(() => {
    getAndSetChatListIds()
  }, [listFlags, queryStr, queryContactId])

  return { chatListIds, listFlags, setListFlags, queryStr, setQueryStr, queryContactId, setQueryContactId }
}

export const PlaceholderChatListItem = React.memo((props) => {
  return (
    <div style={{ height: '64px' }} />
  )
})

export const useLazyChatListItems = (chatListIds) => {
  const scrollRef = useRef(null)
  const fetching = useRef([])
  const [chatItems, setChatItems] = useState({})

  const fetchChatsInView = (_scrollRef) => {
    if (!scrollRef.current) {
      console.log('scrollRef is undefined')
      return
    }
    if (chatListIds.length === 0) return
    const { scrollHeight, scrollTop, clientHeight } = scrollRef.current
    const itemHeight = scrollHeight / chatListIds.length
    const indexStart = Math.floor(scrollTop / itemHeight)
    const indexEnd = Math.floor(1 + indexStart + clientHeight / itemHeight) + 10
    for (let i = indexStart; i <= indexEnd; i++) {
      const chatId = chatListIds[i]
      if (!chatId) break
      fetchChat(chatId)
    }
  }

  const fetchChat = chatId => {
    if (typeof chatItems[chatId] !== 'undefined' || fetching.current.indexOf(chatId) !== -1) return
    fetching.current.push(chatId)
    callDcMethod('getSmallChatById', chatId, chat => {
      setChatItems(chatItems => { return { ...chatItems, [chatId]: chat } })
      console.log(fetching)
      const indexToDelete = fetching.current.indexOf(chatId)
      fetching.current.splice(indexToDelete, indexToDelete)
    })
  }

  useLayoutEffect(() => {
    if (!scrollRef.current) return
    fetchChatsInView(scrollRef)
  }, [chatListIds])
  return [chatItems, fetchChatsInView, scrollRef]
}

export const LazyChatListItem = React.memo(props => {
  const { chatListItem, onClick } = props
  console.log(chatListItem)
  if (typeof chatListItem === 'undefined') return <PlaceholderChatListItem />
  return (
    <ChatListItem
      {...props}
      onClick={onClick}
      chatListItem={chatListItem}
    />
  )
}, (prevProps, nextProps) => {
  const shouldRerender = prevProps.chatListItem !== nextProps.chatListItem || prevProps.isSelected !== nextProps.isSelected
  return !shouldRerender
})
