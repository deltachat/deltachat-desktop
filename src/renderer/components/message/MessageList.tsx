import React, { useRef, useEffect, useCallback, useState } from 'react'
import { MessageWrapper } from './MessageWrapper'
import {
  useChatStore,
  ChatStoreState,
  ChatStoreStateWithChatSet,
} from '../../stores/chat'
import { useDebouncedCallback } from 'use-debounce'
import { C } from 'deltachat-node/dist/constants'
import type { ChatTypes } from 'deltachat-node'
import moment from 'moment'

import { getLogger } from '../../../shared/logger'
import { NormalMessage, FullChat, MetaMessageIs, MetaMessage, DayMarkerMessage } from '../../../shared/shared-types'
import { useTranslationFunction } from '../../contexts'
import { useDCConfigOnce } from '../helpers/useDCConfigOnce'
import MessageListStore, {MessageId, MessageListPage} from '../../stores/MessageListStore'
import {withoutBottomPages, messagesInView, isOnePageOrMoreAwayFromNewestMessage} from './MessageList-Helpers'
import {scrollBeforeFirstPage, scrollBeforeLastPage, calculateMessageKey} from '../../stores/MessageListStore-Helpers'
import {ipcBackend} from '../../ipc'
import {DayMarkerInfoMessage, UnreadMessagesMarker} from './Message'
import {jumpToMessage} from '../helpers/ChatMethods'
const log = getLogger('render/msgList')


export type ConversationType = {
  /* whether this chat has multiple participants */
  hasMultipleParticipants: boolean
  isDeviceChat: boolean
  chatType: ChatTypes
}

const MessageList = function MessageList({
  chat,
}: {
  chat: FullChat
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
    if (!messageListRef.current || !messageListWrapperRef.current) return
    let withoutPagesHeight = messageListRef.current.scrollHeight
    const messageListWrapperHeight = messageListWrapperRef.current.clientHeight

    for (let i = 0; i < pageOrdering.length - 1; i++) {
      const pageKey = pageOrdering[i]
      const pageDOMElement = document.querySelector('#' + pageKey)
      if (!pageDOMElement) continue
      const pageHeight = pageDOMElement.clientHeight
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

  const unreadMessageInViewIntersectionObserver = useRef<IntersectionObserver | null>(null)
  const onUnreadMessageInView: IntersectionObserverCallback = entries => {
    const chatId = MessageListStore.state.chatId
    setTimeout(() => {
      log.debug(`onUnreadMessageInView: entries.length: ${entries.length}`)

      const messageIdsToMarkAsRead = []
      for (const entry of entries) {
        if (!entry.isIntersecting) continue
        const messageKey = entry.target.getAttribute('id')
        if (!messageKey) continue
        const messageId = messageKey.split('-')[4]
        const messageHeight = entry.target.clientHeight

        log.debug(
          `onUnreadMessageInView: messageId ${messageId} height: ${messageHeight} intersectionRate: ${entry.intersectionRatio}`
        )
        log.debug(
          `onUnreadMessageInView: messageId ${messageId} marking as read`
        )

        messageIdsToMarkAsRead.push(Number.parseInt(messageId))
        if (unreadMessageInViewIntersectionObserver.current) {
          unreadMessageInViewIntersectionObserver.current.unobserve(entry.target)
        }
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
    if (!messageListTopRef.current) return
    onMessageListTopObserver.observe(messageListTopRef.current)
    const onMessageListBottomObserver = new IntersectionObserver(
      onMessageListBottom,
      {
        root: null,
        rootMargin: '80px',
        threshold: 0,
      }
    )

    if(!messageListBottomRef.current) return
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
      message: MetaMessage
    ) => JSX.Element | undefined
  ) => {
    
    return messageListStore.pageOrdering.map((pageKey: string) => {
      console.log('xxx pageKey', pageKey)
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
    if (MessageListStore.state.messageIds.length === 0 || messageListRef === null) return
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
            console.log('Hallo!!!')
            if (message.type === MetaMessageIs.DayMarker) {
              return (
                <DayMarkerInfoMessage
                  key={key}
                  key2={key}
                  timestamp={(message as DayMarkerMessage).timestamp}
                />
              )
            } else if (message.type === MetaMessageIs.MarkerOne) {
              return (
                <UnreadMessagesMarker
                  key={key}
                  key2={key}
                  count={message.count}
                />
              )
            } else if (message.type === MetaMessageIs.Normal) {
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
                  message={message as NormalMessage}
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
                  : undefined
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
}

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
    message: MetaMessage
  ) => JSX.Element | undefined
}) {
  const firstMessageIdIndex = page.firstMessageIdIndex
  return (
    <div className={'message-list-page'} id={page.key} key={page.key}>
      <ul key={page.key} id={page.key}>
        {page.messageIds.map((messageId: MessageId, index) => {
          const messageIndex = firstMessageIdIndex + index
          const message: MetaMessage = page.messages[index]
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
