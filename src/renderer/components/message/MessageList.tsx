import React, { useRef, useEffect } from 'react'
import { MessageWrapper } from './MessageWrapper'
import { useChatStore, ChatStoreState } from '../../stores/chat'
import { useDebouncedCallback } from 'use-debounce'
import { C } from 'deltachat-node/dist/constants'
import type { ChatTypes } from 'deltachat-node'
import moment from 'moment'

import { getLogger } from '../../../shared/logger'
import { MessageType } from '../../../shared/shared-types'
import { useTranslationFunction } from '../../contexts'
import { useDCConfigOnce } from '../helpers/useDCConfigOnce'
const log = getLogger('render/msgList')

const messageIdsToShow = (
  oldestFetchedMessageIndex: number,
  messageIds: number[]
) => {
  const messageIdsToShow = []
  for (let i = oldestFetchedMessageIndex; i < messageIds.length; i++) {
    messageIdsToShow.push(messageIds[i])
  }
  return messageIdsToShow
}

export default function MessageList({
  chat,
  refComposer,
}: {
  chat: ChatStoreState
  refComposer: todo
}) {
  const [
    {
      oldestFetchedMessageIndex,
      messages,
      messageIds,
      scrollToBottom,
      scrollToBottomIfClose,
      scrollToLastPage,
      scrollHeight,
    },
    chatStoreDispatch,
  ] = useChatStore()
  const messageListRef = useRef(null)
  const lastKnownScrollHeight = useRef<number>(null)
  const isFetching = useRef(false)

  useEffect(() => {
    if (scrollToBottom === false) return

    log.debug(
      'scrollToBottom',
      messageListRef.current.scrollTop,
      messageListRef.current.scrollHeight
    )
    messageListRef.current.scrollTop = messageListRef.current.scrollHeight
    chatStoreDispatch({
      type: 'FINISHED_SCROLL',
      payload: 'SCROLLED_TO_BOTTOM',
    })

    // Try fetching more messages if needed
    onScroll(null)
  }, [scrollToBottom])

  useEffect(() => {
    if (scrollToBottomIfClose === false) return
    const scrollHeight = lastKnownScrollHeight.current
    const { scrollTop, clientHeight } = messageListRef.current
    const scrollBottom = scrollTop + clientHeight

    const shouldScrollToBottom = scrollBottom >= scrollHeight - 7

    log.debug(
      'scrollToBottomIfClose',
      scrollBottom,
      scrollHeight,
      shouldScrollToBottom
    )

    if (shouldScrollToBottom) {
      messageListRef.current.scrollTop = messageListRef.current.scrollHeight
    }

    chatStoreDispatch({
      type: 'FINISHED_SCROLL',
      payload: 'SCROLLED_TO_BOTTOM',
    })
  }, [scrollToBottomIfClose])

  useEffect(() => {
    if (scrollToLastPage === false) return
    // restore old scroll position after new messages are rendered
    messageListRef.current.scrollTop =
      messageListRef.current.scrollHeight - lastKnownScrollHeight.current
    chatStoreDispatch({
      type: 'FINISHED_SCROLL',
      payload: 'SCROLLED_TO_LAST_PAGE',
    })
    isFetching.current = false
  }, [scrollToLastPage, scrollHeight])

  useEffect(() => {
    isFetching.current = false

    const composerTextarea = refComposer.current.childNodes[1]
    composerTextarea && composerTextarea.focus()
  }, [chat.id])

  useEffect(() => {
    const composerTextarea = refComposer.current.childNodes[1]
    composerTextarea && composerTextarea.focus()
    messageListRef.current.scrollTop = messageListRef.current.scrollHeight
  }, [])

  const [fetchMore] = useDebouncedCallback(
    () => {
      chatStoreDispatch({
        type: 'FETCH_MORE_MESSAGES',
        payload: { scrollHeight: messageListRef.current.scrollHeight },
      })
    },
    30,
    { leading: true }
  )

  const onScroll = (Event: React.UIEvent<HTMLDivElement>) => {
    lastKnownScrollHeight.current = messageListRef.current.scrollHeight
    if (messageListRef.current.scrollTop !== 0) return
    if (isFetching.current === false) {
      isFetching.current = true
      log.debug('Scrolled to top, fetching more messsages!')
      fetchMore()
    }
    Event?.preventDefault()
    Event?.stopPropagation()
    return false
  }

  return (
    <MessageListInner
      onScroll={onScroll}
      oldestFetchedMessageIndex={oldestFetchedMessageIndex}
      messageIds={messageIds}
      messages={messages}
      messageListRef={messageListRef}
      chat={chat}
    />
  )
}

/** Object holding type information about a chat for messages in that chat */
export type ConversationType = {
  /* whether this chat has multiple participants */
  hasMultipleParticipants: boolean
  isDeviceChat: boolean
  chatType: ChatTypes
}

export const MessageListInner = React.memo(
  (props: {
    onScroll: (event: React.UIEvent<HTMLDivElement>) => void
    oldestFetchedMessageIndex: number
    messageIds: number[]
    messages: ChatStoreState['messages']
    messageListRef: todo
    chat: ChatStoreState
  }) => {
    const {
      onScroll,
      oldestFetchedMessageIndex,
      messageIds,
      messages,
      messageListRef,

      chat,
    } = props

    const _messageIdsToShow = messageIdsToShow(
      oldestFetchedMessageIndex,
      messageIds
    )

    let specialMessageIdCounter = 0

    const conversationType: ConversationType = {
      hasMultipleParticipants:
        chat.type === C.DC_CHAT_TYPE_GROUP ||
        chat.type === C.DC_CHAT_TYPE_MAILINGLIST,
      isDeviceChat: chat.isDeviceChat,
      chatType: chat.type,
    }

    return (
      <div id='message-list' ref={messageListRef} onScroll={onScroll}>
        <ul>
          {messageIds.length === 0 && <EmptyChatMessage />}
          {_messageIdsToShow.map((messageId, i) => {
            if (messageId === C.DC_MSG_ID_DAYMARKER) {
              const key = 'magic' + messageId + '_' + specialMessageIdCounter++
              const nextMessage = messages[_messageIdsToShow[i + 1]]
              if (!nextMessage) return null
              return (
                <DayMarker key={key} timestamp={nextMessage.msg.timestamp} />
              )
            }
            const message = messages[messageId]
            if (!message || message.msg == null) {
              log.debug(`Missing message with id ${messageId}`)
              return
            }
            return (
              <MessageWrapper
                key={messageId}
                message={message as MessageType}
                conversationType={conversationType}
              />
            )
          })}
        </ul>
      </div>
    )
  },
  (prevProps, nextProps) => {
    const areEqual =
      prevProps.messageIds === nextProps.messageIds &&
      prevProps.messages === nextProps.messages &&
      prevProps.oldestFetchedMessageIndex ===
        nextProps.oldestFetchedMessageIndex

    return areEqual
  }
)

function EmptyChatMessage() {
  const tx = useTranslationFunction()
  const [chat] = useChatStore()

  let emptyChatMessage = tx('chat_no_messages_hint', [chat.name, chat.name])

  const showAllEmail = useDCConfigOnce('show_emails')

  if (chat.isGroup && !chat.isDeaddrop) {
    emptyChatMessage = chat.isUnpromoted
      ? tx('chat_new_group_hint')
      : tx('chat_no_messages')
  } else if (chat.isSelfTalk) {
    emptyChatMessage = tx('saved_messages_explain')
  } else if (chat.isDeviceChat) {
    emptyChatMessage = tx('device_talk_explain')
  } else if (chat.isDeaddrop) {
    emptyChatMessage =
      Number(showAllEmail) !== C.DC_SHOW_EMAILS_ALL
        ? tx('chat_no_contact_requests')
        : tx('chat_no_messages')
  }

  return (
    <li>
      <div className='info-message big'>
        <p>{emptyChatMessage}</p>
      </div>
    </li>
  )
}

export function DayMarker(props: { timestamp: number }) {
  const { timestamp } = props
  const tx = useTranslationFunction()
  return (
    <div className='info-message'>
      <p style={{ textTransform: 'capitalize' }}>
        {moment.unix(timestamp).calendar(null, {
          sameDay: `[${tx('today')}]`,
          lastDay: `[${tx('yesterday')}]`,
          lastWeek: 'LL',
          sameElse: 'LL',
        })}
      </p>
    </div>
  )
}
