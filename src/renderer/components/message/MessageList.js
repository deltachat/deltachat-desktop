import React, { useRef, useEffect } from 'react'
import MessageWrapper, { InfoMessage } from './MessageWrapper'
import { useChatStore } from '../../stores/chat'
import { useDebouncedCallback } from 'use-debounce'
import C from 'deltachat-node/constants'
import moment from 'moment'

import { getLogger } from '../../../shared/logger'
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
  const lastKnownScrollHeight = useRef([null, null])
  const isFetching = useRef(false)

  useEffect(() => {
    if (scrollToBottom === false) return

    log.debug('scrollToBottom', messageListRef.current.scrollTop, messageListRef.current.scrollHeight)
    messageListRef.current.scrollTop = messageListRef.current.scrollHeight
    chatStoreDispatch({ type: 'FINISHED_SCROLL', payload: 'SCROLLED_TO_BOTTOM' })
  }, [scrollToBottom])

  useEffect(() => {
    if (scrollToLastPage === false) return
    // restore old scroll position after new messages are rendered
    messageListRef.current.scrollTop = messageListRef.current.scrollHeight - lastKnownScrollHeight.current
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
    if (messageListRef.current.scrollTop !== 0) return
    if (isFetching.current === false) {
      lastKnownScrollHeight.current = messageListRef.current.scrollHeight
      isFetching.current = true
      log.debug('Scrolled to top, fetching more messsages!')
      fetchMore()
    }
    Event.preventDefault()
    Event.stopPropagation()
    return false
  }

  return <MessageListInner
    onScroll={onScroll}
    oldestFetchedMessageIndex={oldestFetchedMessageIndex}
    messageIds={messageIds}
    messages={messages}
    messageListRef={messageListRef}
    locationStreamingEnabled={locationStreamingEnabled}
    chat={chat}
    chatStoreDispatch={chatStoreDispatch}
  />
}

export const MessageListInner = React.memo((props) => {
  const {
    onScroll,
    oldestFetchedMessageIndex,
    messageIds,
    messages,
    messageListRef,
    locationStreamingEnabled,
    chat,
    chatStoreDispatch
  } = props

  const _messageIdsToShow = messageIdsToShow(oldestFetchedMessageIndex, messageIds)
  const tx = window.translate

  let specialMessageIdCounter = 0

  let emptyChatMessage = tx('chat_no_messages_hint', [chat.name, chat.name])

  if (chat.isGroup) {
    emptyChatMessage = chat.isUnpromoted ? tx('chat_new_group_hint') : tx('chat_no_messages')
  } else if (chat.isSelfTalk) {
    emptyChatMessage = tx('saved_messages_explain')
  } else if (chat.isDeviceChat) {
    emptyChatMessage = tx('device_talk_explain')
  }

  return (
    <div id='message-list' ref={messageListRef} onScroll={onScroll}>
      <ul>
        { messageIds.length < 1 ? <li><InfoMessage><p className='info-message'>{emptyChatMessage}</p></InfoMessage></li> : ''}
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
              locationStreamingEnabled={locationStreamingEnabled}
              chat={chat}
              chatStoreDispatch={chatStoreDispatch}
            />
          )
        })}
      </ul>
    </div>
  )
}, (prevProps, nextProps) => {
  const areEqual = prevProps.messageIds === nextProps.messageIds &&
    prevProps.messages === nextProps.messages &&
    prevProps.oldestFetchedMessageIndex === nextProps.oldestFetchedMessageIndex &&
    prevProps.locationStreamingEnabled === nextProps.locationStreamingEnabled

  return areEqual
})

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
