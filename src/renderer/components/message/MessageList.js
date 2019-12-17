import React, { useRef, useEffect } from 'react'
import MessageWrapper, { InfoMessage } from './MessageWrapper'
import { useChatStore } from '../../stores/chat'
import { useDebouncedCallback } from 'use-debounce'
import C from 'deltachat-node/constants'
import moment from 'moment'

import { getLogger } from '../../../logger'
const log = getLogger('render/msgList')

const messageIdsToShow = (oldestFetchedMessageIndex, messageIds) => {
  const messageIdsToShow = []
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
    scrollHeight
  }, chatStoreDispatch] = useChatStore()
  const messageListRef = useRef(null)
  const lastKnownScrollPosition = useRef([null, null])
  const isFetching = useRef(false)

  useEffect(() => {
    if (scrollToBottom === false) return
    messageListRef.current.scrollTop = messageListRef.current.scrollHeight
    setTimeout(() => {
      messageListRef.current.scrollTop = messageListRef.current.scrollHeight
    }, 30)
    chatStoreDispatch({ type: 'FINISHED_SCROLL', payload: 'SCROLLED_TO_BOTTOM' })
  }, [scrollToBottom])

  useEffect(() => {
    if (scrollToLastPage === false) return
    // restore old scroll position after new messages are rendered
    messageListRef.current.scrollTop = messageListRef.current.scrollHeight - lastKnownScrollPosition.current
    chatStoreDispatch({ type: 'FINISHED_SCROLL', payload: 'SCROLLED_TO_LAST_PAGE' })
    isFetching.current = false
  }, [scrollToLastPage, scrollHeight])

  useEffect(() => {
    isFetching.current = false
  }, [chat.id])

  const [fetchMore] = useDebouncedCallback(() => {
    chatStoreDispatch({ type: 'FETCH_MORE_MESSAGES', payload: { scrollHeight: messageListRef.current.scrollHeight } })
  }, 30, { leading: true })

  const onScroll = Event => {
    if (messageListRef.current.scrollTop === 0 && isFetching.current === false) {
      lastKnownScrollPosition.current = messageListRef.current.scrollHeight
      isFetching.current = true
      log.debug('Scrolled to top, fetching more messsages!')
      fetchMore()
    }
  }

  const _messageIdsToShow = messageIdsToShow(oldestFetchedMessageIndex, messageIds)

  let specialMessageIdCounter = 0
  return (
    <div id='message-list' ref={messageListRef} onScroll={onScroll}>
      <ul >
        {_messageIdsToShow.map((messageId, i) => {
          if (messageId === C.DC_MSG_ID_DAYMARKER) {
            const key = 'magic' + messageId + '_' + specialMessageIdCounter++
            const nextMessage = messages[_messageIdsToShow[i + 1]]
            if (!nextMessage) return null
            return <DayMarker key={key} timestamp={nextMessage.msg.timestamp} />
          }
          const message = messages[messageId]
          if (!message) return
          return (
            <MessageWrapper.render
              key={messageId}
              message={message}
              chat={chat}
              locationStreamingEnabled={locationStreamingEnabled}
            />
          )
        })}
      </ul>
    </div>
  )
}

export function DayMarker (props) {
  const { timestamp } = props
  const tx = window.translate
  return (
    <InfoMessage>
      <p style={{ textTransform: 'capitalize' }}>
        {moment.unix(timestamp).calendar(null, {
          sameDay: `[${tx('today')}]`,
          lastDay: `[${tx('yesterday')}]`,
          lastWeek: 'LL',
          sameElse: 'LL'
        })}
      </p>
    </InfoMessage>
  )
}
