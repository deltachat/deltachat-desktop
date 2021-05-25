import React, { useEffect, useRef, useState } from 'react'
import MessageListStore, {
  MessageId,
  MessageListPage,
} from '../../stores/MessageListStore'
import { MessageWrapper } from './MessageWrapper'
import {
  MessageType,
  MessageDayMarker,
  Message,
  MessageTypeIs,
} from '../../../shared/shared-types'
import { getLogger } from '../../../shared/logger'
import { DayMarkerInfoMessage, UnreadMessagesMarker } from './Message'
import { ChatStoreState } from '../../stores/chat'
import { C } from 'deltachat-node/dist/constants'
import type { ChatTypes } from 'deltachat-node'
import { jumpToMessage, selectChat } from '../helpers/ChatMethods'
import { ipcBackend } from '../../ipc'
import { DeltaBackend } from '../../delta-remote'
import {
  calculateMessageKey,
  parseMessageKey,
  scrollBeforeFirstPage,
  scrollBeforeLastPage,
} from '../../stores/MessageListStore-Helpers'
import {
  isScrolledToBottom,
  withoutBottomPages,
  messagesInView,
  rotateAwayFromIndex,
  isOnePageOrMoreAwayFromNewestMessage,
} from './MessageList-Helpers'

const log = getLogger('renderer/message/MessageList')

export type ConversationType = {
  /* whether this chat has multiple participants */
  hasMultipleParticipants: boolean
  isDeviceChat: boolean
  chatType: ChatTypes
}

const MessageList = React.memo(function MessageList({
  chat,
}: {
  chat: ChatStoreState
}) {
  const messageListRef = useRef<HTMLDivElement>(null)
  const messageListWrapperRef = useRef<HTMLDivElement>(null)
  const messageListTopRef = useRef<HTMLDivElement>(null)
  const messageListBottomRef = useRef<HTMLDivElement>(null)

  const [
    onePageAwayFromNewestMessage,
    setOnePageAwayFromNewestMessage,
  ] = useState(false)

  const { state: messageListStore } = MessageListStore.useStore({
    messageListRef,
    messageListWrapperRef,
    messageListTopRef,
    messageListBottomRef,
  })

  const onMessageListTop: IntersectionObserverCallback = entries => {
    const chatId = MessageListStore.state.chatId
    const pageOrdering = MessageListStore.state.pageOrdering
    log.debug(`onMessageListTop`)
    if (
      !entries[0].isIntersecting ||
      MessageListStore.currentlyLoadingPage === true ||
      pageOrdering.length === 0
    )
      return
    const withoutPages = withoutBottomPages(
      messageListRef,
      messageListWrapperRef
    )

    MessageListStore.loadPageBefore(chatId, withoutPages, [
      {
        isLayoutEffect: true,
        action: scrollBeforeFirstPage(chatId),
      },
    ])
  }
  const onMessageListBottom: IntersectionObserverCallback = entries => {
    const chatId = MessageListStore.state.chatId
    const pageOrdering = MessageListStore.state.pageOrdering
    if (
      !entries[0].isIntersecting ||
      MessageListStore.currentlyLoadingPage === true ||
      pageOrdering.length === 0
    )
      return
    log.debug('onMessageListBottom')
    const withoutPages = []
    let withoutPagesHeight = messageListRef.current.scrollHeight
    const messageListWrapperHeight = messageListWrapperRef.current.clientHeight

    for (let i = 0; i < pageOrdering.length - 1; i++) {
      const pageKey = pageOrdering[i]
      const pageHeight = document.querySelector('#' + pageKey).clientHeight
      const updatedWithoutPagesHeight = withoutPagesHeight - pageHeight

      if (updatedWithoutPagesHeight > messageListWrapperHeight * 4) {
        withoutPages.push(pageKey)
        withoutPagesHeight = updatedWithoutPagesHeight
      } else {
        break
      }
    }
    MessageListStore.loadPageAfter(chatId, withoutPages, [
      {
        isLayoutEffect: false,
        action: scrollBeforeLastPage(chatId),
      },
    ])
  }

  const unreadMessageInViewIntersectionObserver = useRef(null)
  const onUnreadMessageInView: IntersectionObserverCallback = entries => {
    const chatId = MessageListStore.state.chatId
    setTimeout(() => {
      log.debug(`onUnreadMessageInView: entries.length: ${entries.length}`)

      const messageIdsToMarkAsRead = []
      for (const entry of entries) {
        if (!entry.isIntersecting) continue
        const messageKey = entry.target.getAttribute('id')
        const messageId = messageKey.split('-')[4]
        const messageHeight = entry.target.clientHeight

        log.debug(
          `onUnreadMessageInView: messageId ${messageId} height: ${messageHeight} intersectionRate: ${entry.intersectionRatio}`
        )
        log.debug(
          `onUnreadMessageInView: messageId ${messageId} marking as read`
        )

        messageIdsToMarkAsRead.push(Number.parseInt(messageId))
        unreadMessageInViewIntersectionObserver.current.unobserve(entry.target)
      }

      if (messageIdsToMarkAsRead.length > 0) {
        MessageListStore.markMessagesSeen(chatId, messageIdsToMarkAsRead)
      }
    })
  }

  const onMsgsChanged = async () => {
    MessageListStore.onMessagesChanged({
      messageListRef,
      messageListBottomRef,
      messageListTopRef,
      messageListWrapperRef,
    })
  }

  const onIncomingMessage = async (
    _event: any,
    [chatId, _messageId]: [number, number]
  ) => {
    if (chatId !== MessageListStore.state.chatId) {
      log.debug('onMsgsChanged: not for currently selected chat, returning')
      return
    }
    onMsgsChanged()
  }

  useEffect(() => {
    const onMessageListTopObserver = new IntersectionObserver(
      onMessageListTop,
      {
        root: null,
        rootMargin: '80px',
        threshold: 0,
      }
    )
    onMessageListTopObserver.observe(messageListTopRef.current)
    const onMessageListBottomObserver = new IntersectionObserver(
      onMessageListBottom,
      {
        root: null,
        rootMargin: '80px',
        threshold: 0,
      }
    )
    onMessageListBottomObserver.observe(messageListBottomRef.current)
    unreadMessageInViewIntersectionObserver.current = new IntersectionObserver(
      onUnreadMessageInView,
      {
        root: null,
        rootMargin: '0px',
        threshold: [0, 1],
      }
    )

    ipcBackend.on('DC_EVENT_MSGS_CHANGED', onMsgsChanged)
    ipcBackend.on('DC_EVENT_INCOMING_MSG', onIncomingMessage)

    // ONLY FOR DEBUGGING, REMOVE BEFORE MERGE
    ;((window as unknown) as any).messagesInView = () => {
      for (const m of messagesInView(messageListRef)) {
        /* ignore-console-log */
        console.debug(m.messageElement)
      }
    }
    ;((window as unknown) as any).refreshMessages = onMsgsChanged

    return () => {
      onMessageListTopObserver.disconnect()
      onMessageListBottomObserver.disconnect()
      unreadMessageInViewIntersectionObserver.current?.disconnect()
      ipcBackend.removeListener('DC_EVENT_MSGS_CHANGED', onMsgsChanged)
      ipcBackend.removeListener('DC_EVENT_INCOMING_MSG', onIncomingMessage)
    }
  }, [])

  const iterateMessages = (
    mapFunction: (
      key: string,
      messageId: MessageId,
      messageIndex: number,
      message: MessageType
    ) => JSX.Element
  ) => {
    return messageListStore.pageOrdering.map((pageKey: string) => {
      return (
        <MessagePage
          key={pageKey}
          page={messageListStore.pages[pageKey]}
          mapFunction={mapFunction}
        />
      )
    })
  }

  const onScroll = () => {
    if (MessageListStore.state.messageIds.length === 0) return
    setOnePageAwayFromNewestMessage(
      isOnePageOrMoreAwayFromNewestMessage(
        MessageListStore.state,
        messageListRef
      )
    )
  }

  return (
    <>
      <div
        className='message-list-wrapper'
        style={{ height: '100%' }}
        ref={messageListWrapperRef}
      >
        <div id='message-list' ref={messageListRef} onScroll={onScroll}>
          <div
            key='message-list-top'
            id='message-list-top'
            ref={messageListTopRef}
          />
          {iterateMessages((key, _messageId, _messageIndex, message) => {
            if (message.type === MessageTypeIs.DayMarker) {
              return (
                <DayMarkerInfoMessage
                  key={key}
                  key2={key}
                  timestamp={(message as MessageDayMarker).timestamp}
                />
              )
            } else if (message.type === MessageTypeIs.MarkerOne) {
              return (
                <UnreadMessagesMarker
                  key={key}
                  key2={key}
                  count={message.count}
                />
              )
            } else if (message.type === MessageTypeIs.Message) {
              const conversationType: ConversationType = {
                hasMultipleParticipants:
                  chat.type === C.DC_CHAT_TYPE_GROUP ||
                  chat.type === C.DC_CHAT_TYPE_MAILINGLIST,
                isDeviceChat: chat.isDeviceChat,
                chatType: chat.type,
              }
              return (
                <MessageWrapper
                  key={key}
                  key2={key}
                  message={message as Message}
                  conversationType={conversationType}
                  isDeviceChat={chat.isDeviceChat}
                  unreadMessageInViewIntersectionObserver={
                    unreadMessageInViewIntersectionObserver
                  }
                />
              )
            }
          })}
          <div
            key='message-list-bottom'
            id='message-list-bottom'
            ref={messageListBottomRef}
          />
        </div>
      </div>
      {(onePageAwayFromNewestMessage === true ||
        messageListStore.unreadMessageIds.length > 0) && (
        <>
          <div className='unread-message-counter'>
            <div
              className='counter'
              style={
                messageListStore.unreadMessageIds.length === 0
                  ? { visibility: 'hidden' }
                  : null
              }
            >
              {messageListStore.unreadMessageIds.length}
            </div>
            <div
              className='jump-to-bottom-button'
              onClick={() => {
                // Mark all messages in this chat as read
                MessageListStore.markMessagesSeen(
                  messageListStore.chatId,
                  messageListStore.unreadMessageIds
                )
                jumpToMessage(
                  messageListStore.messageIds[
                    messageListStore.messageIds.length - 1
                  ]
                )
              }}
            >
              <div className='jump-to-bottom-icon' />
            </div>
          </div>
        </>
      )}
    </>
  )
})

export default MessageList

export function MessagePage({
  page,
  mapFunction,
}: {
  page: MessageListPage
  mapFunction: (
    key: string,
    messageId: MessageId,
    messageIndex: number,
    message: MessageType
  ) => JSX.Element
}) {
  const firstMessageIdIndex = page.firstMessageIdIndex
  return (
    <div className={'message-list-page'} id={page.key} key={page.key}>
      <ul key={page.key} id={page.key}>
        {page.messageIds.map((messageId: MessageId, index) => {
          const messageIndex = firstMessageIdIndex + index
          const message: MessageType = page.messages[index]
          if (!message) return null
          const messageKey = calculateMessageKey(
            page.key,
            messageId,
            messageIndex
          )
          return mapFunction(messageKey, messageId, messageIndex, message)
        })}
      </ul>
    </div>
  )
}
