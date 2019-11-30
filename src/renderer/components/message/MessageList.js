import React, { useContext, useRef, useEffect, useState, useLayoutEffect, useCallback, useMemo } from 'react'
import MessageWrapper from './MessageWrapper'
import ScreenContext from '../../contexts/ScreenContext'
import { callDcMethod } from '../../ipc'
import MessageListStore from '../../stores/MessageList'
import { useDebouncedCallback } from 'use-debounce'

import { getLogger } from '../../../logger'
const log = getLogger('render/msgList')

const PAGE_SIZE = 30

export function useStore(StoreInstance) {
  const [state, setState] = useState(StoreInstance.getState())
  const [page, setPage] = useState(1)

  useEffect(() => {
    StoreInstance.subscribe(setState)
    return () => StoreInstance.unsubscribe(setState)
  }, [])

  return [state, StoreInstance.dispatch.bind(StoreInstance)]
}

const messageIdsToShow = (oldestFetchedMessageIndex, messageIds) => {
  let messageIdsToShow = []
  for (let i = oldestFetchedMessageIndex; i < messageIds.length; i++) {
    messageIdsToShow.push(messageIds[i])
  }
  return messageIdsToShow
}

export default function MessageList ({ chat, refComposer, locationStreamingEnabled }) {
  const [{
    oldestFetchedMessageIndex,
    messages,
    messageIds,
    scrollToBottom,
    scrollToLastPage,
    scrollHeight,
    countFetchedMessages
  }, messageListDispatch] = useStore(MessageListStore)
  const messageListRef = useRef(null)
  const lastKnownScrollPosition = useRef([null,null])
  const isFetching = useRef(false)

  useLayoutEffect(() => {
    if (scrollToBottom === false) return
    messageListRef.current.scrollTop = messageListRef.current.scrollHeight
    setTimeout(() => {
      messageListRef.current.scrollTop = messageListRef.current.scrollHeight
    }, 30)
    messageListDispatch({type: 'SCROLLED_TO_BOTTOM'})
  }, [scrollToBottom])

  useLayoutEffect(() => {
    if (scrollToLastPage === false) return
    console.log('scrollToLastMessageOnLastPage', lastKnownScrollPosition.current)
    messageListRef.current.scrollTop = messageListRef.current.scrollHeight - lastKnownScrollPosition.current
    messageListDispatch({type: 'SCROLLED_TO_LAST_PAGE'})
    isFetching.current = false
  }, [scrollToLastPage, scrollHeight])

  useEffect(() => {
    messageListDispatch({type: 'SELECT_CHAT', payload: chat.id })
    isFetching.current = false
  }, [chat.id])

  const [fetchMore] = useDebouncedCallback(() => {
    messageListDispatch({type: 'FETCH_MORE_MESSAGES', payload: {scrollHeight: messageListRef.current.scrollHeight }})
  }, 30, { leading: true })

  const onScroll = Event => {
    if (messageListRef.current.scrollTop == 0 && isFetching.current === false) {
      lastKnownScrollPosition.current = messageListRef.current.scrollHeight
      isFetching.current = true
      log.debug('Scrolled to top, fetching more messsages!')
      fetchMore()
    }
  }

  const _messageIdsToShow = messageIdsToShow(oldestFetchedMessageIndex, messageIds)
  console.log('Rerender!')

  const tx = window.translate
  let specialMessageIdCounter = 0
  return (
    <div id='message-list' ref={messageListRef} onScroll={onScroll}>
      <ul>
        {_messageIdsToShow.map(messageId => {
          const key = messageId <= 9 ?
            'magic' + messageId + '_' + specialMessageIdCounter++ :
            messageId
          const message = messages[messageId]
          if (!message) return
          return (
            <MessageWrapper.render
              key={key}
              message={message}
              chat={chat}
              locationStreamingEnabled={locationStreamingEnabled}
            />
          )
        })} 
        })>
      </ul>
    </div>
  )
}

