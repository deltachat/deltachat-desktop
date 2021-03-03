import React, { useEffect, useRef, useState } from 'react'
import MessageListStore, {
  MessageId,
  MessageListPage,
} from '../../stores/MessageListStore'
import { Action } from '../../stores/store2'
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
import moment from 'moment'
import { jumpToMessage, selectChat } from '../helpers/ChatMethods'
import { ipcBackend } from '../../ipc'
import { DeltaBackend } from '../../delta-remote'
import {
  calculateMessageKey,
  parseMessageKey,
} from '../../stores/MessageListStore-Helpers'
import {
  isScrolledToBottom,
  withoutTopPages,
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
  const messageListRef = useRef(null)
  const messageListWrapperRef = useRef(null)
  const messageListTopRef = useRef(null)
  const messageListBottomRef = useRef(null)
  const [
    onePageAwayFromNewestMessage,
    setOnePageAwayFromNewestMessage,
  ] = useState(false)
  const onMessageListStoreEffect = (action: Action) => {
    if (action.type === 'SCROLL_BEFORE_LAST_PAGE') {
      log.debug(`SCROLL_BEFORE_LAST_PAGE`)
      setTimeout(() => {
        const lastPage =
          messageListStore.pages[
            messageListStore.pageOrdering[
              messageListStore.pageOrdering.length - 1
            ]
          ]

        if (!lastPage) {
          log.debug(`SCROLL_BEFORE_LAST_PAGE: lastPage is null, returning`)
          return
        }

        log.debug(`SCROLL_BEFORE_LAST_PAGE lastPage ${lastPage.key}`)
      })
    }
  }

  const onMessageListStoreLayoutEffect = (action: Action) => {
    if (action.type === 'SCROLL_TO_BOTTOM_AND_CHECK_IF_WE_NEED_TO_LOAD_MORE') {
      const { scrollTop, scrollHeight } = messageListRef.current
      log.debug(
        `SCROLL_TO_BOTTOM_AND_CHECK_IF_WE_NEED_TO_LOAD_MORE scrollTop: ${scrollTop} scrollHeight ${scrollHeight}`
      )

      messageListRef.current.scrollTop = scrollHeight
      const messageListWrapperHeight =
        messageListWrapperRef.current.clientHeight
      log.debug(
        `SCROLL_TO_BOTTOM_AND_CHECK_IF_WE_NEED_TO_LOAD_MORE: messageListWrapperHeight: ${messageListWrapperHeight} scrollHeight: ${scrollHeight}`
      )
      if (scrollHeight <= messageListWrapperHeight) {
        MessageListStore.loadPageBefore(
          messageListStore.chatId,
          [],
          [
            {
              isLayoutEffect: true,
              action: {
                type: 'SCROLL_TO_BOTTOM_AND_CHECK_IF_WE_NEED_TO_LOAD_MORE',
                payload: {},
                id: messageListStore.chatId,
              },
            },
          ]
        )
      }
    } else if (
      action.type === 'SCROLL_TO_TOP_OF_PAGE_AND_CHECK_IF_WE_NEED_TO_LOAD_MORE'
    ) {
      const { pageKey } = action.payload
      const { scrollTop, scrollHeight } = messageListRef.current
      log.debug(
        `SCROLL_TO_TOP_OF_PAGE_AND_CHECK_IF_WE_NEED_TO_LOAD_MORE scrollTop: ${scrollTop} scrollHeight ${scrollHeight}`
      )

      const pageElement = document.querySelector('#' + pageKey)
      if (!pageElement) {
        log.warn(
          `SCROLL_TO_TOP_OF_PAGE_AND_CHECK_IF_WE_NEED_TO_LOAD_MORE pageElement is null, returning`
        )
        return
      }
      pageElement.scrollIntoView(true)
      const firstChild = pageElement.firstElementChild
      if (!firstChild) {
        log.warn(
          `SCROLL_TO_TOP_OF_PAGE_AND_CHECK_IF_WE_NEED_TO_LOAD_MORE firstChild is null, returning`
        )
        return
      }
    } else if (
      action.type === 'SCROLL_TO_MESSAGE_AND_CHECK_IF_WE_NEED_TO_LOAD_MORE'
    ) {
      const { pageKey, messageIdIndex } = action.payload
      const pageElement = document.querySelector('#' + pageKey)
      if (!pageElement) {
        log.warn(
          `SCROLL_TO_MESSAGE_AND_CHECK_IF_WE_NEED_TO_LOAD_MORE pageElement is null, returning`
        )
        return
      }

      const messageKey = calculateMessageKey(
        pageKey,
        messageListStore.messageIds[messageIdIndex],
        messageIdIndex
      )

      const messageElement = pageElement.querySelector('#' + messageKey)
      if (!messageElement) {
        log.warn(
          `SCROLL_TO_MESSAGE_AND_CHECK_IF_WE_NEED_TO_LOAD_MORE messageElement is null, returning`
        )
        return
      }
      //messageElement.setAttribute('style', 'background-color: yellow')

      let { scrollTop } = messageListRef.current
      const { scrollHeight, clientHeight } = messageListRef.current
      scrollTop = messageListRef.current.scrollTop = ((messageElement as unknown) as any).offsetTop
      if (scrollTop === 0 && MessageListStore.canLoadPageBefore(pageKey)) {
        log.debug(
          `SCROLL_TO_MESSAGE_AND_CHECK_IF_WE_NEED_TO_LOAD_MORE: scrollTop === 0, load page before`
        )

        MessageListStore.loadPageBefore(
          action.id,
          [],
          [
            {
              isLayoutEffect: true,
              action: {
                type: 'SCROLL_TO_MESSAGE_AND_CHECK_IF_WE_NEED_TO_LOAD_MORE',
                payload: action.payload,
                id: messageListStore.chatId,
              },
            },
          ]
        )
      } else if (
        scrollHeight - scrollTop <= clientHeight &&
        MessageListStore.canLoadPageAfter(pageKey)
      ) {
        log.debug(
          `SCROLL_TO_MESSAGE_AND_CHECK_IF_WE_NEED_TO_LOAD_MORE: ((scrollHeight - scrollTop) <= clientHeight) === true, load page after`
        )
        MessageListStore.loadPageAfter(
          action.id,
          [],
          [
            {
              isLayoutEffect: true,
              action: {
                type: 'SCROLL_TO_MESSAGE_AND_CHECK_IF_WE_NEED_TO_LOAD_MORE',
                payload: action.payload,
                id: messageListStore.chatId,
              },
            },
          ]
        )
      } else {
        log.debug(
          `SCROLL_TO_MESSAGE_AND_CHECK_IF_WE_NEED_TO_LOAD_MORE no need to load anything`
        )
      }
    } else if (action.type === 'SCROLL_BEFORE_FIRST_PAGE') {
      log.debug(`SCROLL_BEFORE_FIRST_PAGE`)
      const beforeFirstPage =
        messageListStore.pages[messageListStore.pageOrdering[1]]

      if (!beforeFirstPage) {
        log.debug(`SCROLL_BEFORE_FIRST_PAGE: beforeLastPage is null, returning`)
        return
      }

      document.querySelector('#' + beforeFirstPage.key).scrollIntoView()
    } else if (action.type === 'INCOMING_MESSAGES') {
      if (action.id !== MessageListStore.state.chatId) {
        log.debug(
          `INCOMING_MESSAGES: action id mismatches state.chatId. Returning.`
        )
        return
      }

      const { scrollTop, scrollHeight } = messageListRef.current
      const { wrapperHeight } = messageListWrapperRef.current

      const lastPageKey =
        MessageListStore.state.pageOrdering[
          MessageListStore.state.pageOrdering.length - 1
        ]
      const lastPage = MessageListStore.state.pages[lastPageKey]

      const isPreviousMessageLoaded =
        lastPage.messageIds[lastPage.messageIds.length - 1] ===
        MessageListStore.state.messageIds[
          MessageListStore.state.messageIds.length - 2
        ]

      log.debug(
        `INCOMING_MESSAGES: scrollHeight: ${scrollHeight} scrollTop: ${scrollTop} wrapperHeight: ${wrapperHeight}`
      )

      const scrolledToBottom = isScrolledToBottom(
        scrollTop,
        scrollHeight,
        wrapperHeight
      )

      const scrollToTopOfMessage = scrolledToBottom && isPreviousMessageLoaded
      log.debug(
        `INCOMING_MESSAGES: scrollToTopOfMessage ${scrollToTopOfMessage} scrolledToBottom: ${scrolledToBottom} isPreviousMessageLoaded: ${isPreviousMessageLoaded}`
      )

      if (scrollToTopOfMessage) {
        const withoutPages = withoutTopPages(
          messageListRef,
          messageListWrapperRef
        )
        const messageId =
          MessageListStore.state.messageIds[
            MessageListStore.state.messageIds.length - 1
          ]

        MessageListStore.loadPageAfter(action.id, withoutPages, [
          {
            isLayoutEffect: true,
            action: {
              type: 'SCROLL_TO_BOTTOM_AND_CHECK_IF_WE_NEED_TO_LOAD_MORE',
              payload: messageId,
              id: messageListStore.chatId,
            },
          },
        ])
      }
    } else if (action.type === 'RESTORE_SCROLL_POSITION') {
      if (action.id !== MessageListStore.state.chatId) {
        log.debug(
          `RESTORE_SCROLL_POSITION: action id mismatches state.chatId. Returning.`
        )
        return
      }
      messageListRef.current.scrollTop = scrollPositionBeforeSetState.current
      log.debug(
        `RESTORE_SCROLL_POSITION: restored scrollPosition to ${action.payload}`
      )
    } else if (action.type === 'SCROLL_TO_MESSAGE') {
      if (action.id !== MessageListStore.state.chatId) {
        log.debug(
          `SCROLL_TO_MESSAGE: action id mismatches state.chatId. Returning.`
        )
        return
      }

      const messageElement = document.querySelector(
        '#' + action.payload.messageKey
      ) as HTMLElement

      messageListRef.current.scrollTop =
        messageElement.offsetTop + action.payload.relativeScrollPosition
      log.debug(
        `SCROLL_TO_MESSAGE: restored scrollPosition to ${action.payload}`
      )
    }
  }

  const scrollPositionBeforeSetState = useRef(-1)

  const { state: messageListStore } = MessageListStore.useStore(
    onMessageListStoreEffect,
    onMessageListStoreLayoutEffect
  )


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
        action: { type: 'SCROLL_BEFORE_FIRST_PAGE', payload: {}, id: chatId },
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
        action: { type: 'SCROLL_BEFORE_LAST_PAGE', payload: {}, id: chatId },
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
    if (MessageListStore.ignoreDcEventMsgsChanged > 0) {
      MessageListStore.ignoreDcEventMsgsChanged--
      log.debug(
        'onMsgsChanged: MessageListSotre.ignoreDcEventMsgsChanged is > 0, so we do. returning'
      )
      return
    }
    const chatId = MessageListStore.state.chatId

    const scrollTop = messageListRef.current.scrollTop
    const scrollHeight = messageListRef.current.scrollHeight
    const wrapperHeight = messageListWrapperRef.current.clientHeight

    if (isScrolledToBottom(scrollTop, scrollHeight, wrapperHeight)) {
      MessageListStore.selectChat(chatId)
      return
    }

    const unreadMessageIds = await DeltaBackend.call(
      'messageList.getUnreadMessageIds',
      chatId
    )
    const firstUnreadMessageId =
      unreadMessageIds.length > 0 ? unreadMessageIds[0] : -1
    const marker1MessageId = firstUnreadMessageId || 0
    const marker1Counter = unreadMessageIds.length
    const markerOne = {
      ...MessageListStore.state.markerOne,
      [marker1MessageId]: marker1Counter,
    }

    const messageIds = await DeltaBackend.call(
      'messageList.getMessageIds',
      chatId,
      markerOne
    )

    for (const { messageElement, messageOffsetTop } of messagesInView(
      messageListRef
    )) {
      const { messageId, messageIndex: oldMessageIndex } = parseMessageKey(
        messageElement.getAttribute('id')
      )
	
    const conversationType: ConversationType = {
      hasMultipleParticipants:
        chat.type === C.DC_CHAT_TYPE_GROUP ||
        chat.type === C.DC_CHAT_TYPE_MAILINGLIST,
      isDeviceChat: chat.isDeviceChat,
      chatType: chat.type,
    }

      const messageIndex = messageIds.indexOf(messageId)
      if (messageId <= 9 && oldMessageIndex !== messageIndex) {
        continue
      }

      if (messageIndex === -1) continue

      // Position of messageBottom on screen
      const relativeScrollPosition = scrollTop - messageOffsetTop

      if (MessageListStore.currentlyDispatchedCounter > 0) return
      MessageListStore.refresh(
        chatId,
        messageIds,
        messageIndex,
        relativeScrollPosition
      )

      return
    }

    const firstMessageInView = messagesInView(messageListRef).next().value
    if (!firstMessageInView) {
      log.debug(
        `onMsgsChanged: No message in view. Should normally not happen. Let's just select the chat again?`
      )

      return selectChat(MessageListStore.state.chatId)
    }

    const { messageIndex: indexOfFirstMessageInView } = parseMessageKey(
      firstMessageInView.messageElement.getAttribute('id')
    )
    log.debug(
      `onMsgsChanged: No message in view is in changed messageIds. Trying to find closest still existing message. indexOfFirstMessageInView: ${indexOfFirstMessageInView}`
    )
    const oldMessageIds = MessageListStore.state.messageIds

    // Find closest still existing messageId and jump there
    for (const oldMessageIndex of rotateAwayFromIndex(
      indexOfFirstMessageInView,
      messageIds.length
    )) {
      const messageId = oldMessageIds[oldMessageIndex]
      const realMessageIndex = messageIds.indexOf(messageId)
      if (messageId <= 9 && oldMessageIndex !== realMessageIndex) {
        continue
      }

if (realMessageIndex === -1) continue

      // In theory it would be better/more accurate to jump to the bottom if firstMessageIndexInView < indexOfFirstMessageInView
      // and to the top of the message if firstMessageIndexInView > indexOfFirstMessageInView
      // But this should be good enough for now
      MessageListStore.jumpToMessage(chatId, messageId)
      return
    }

    log.debug(
      'onMsgsChanged: Could not find a message to restore from. Reloading chat.'
    )
    MessageListStore.selectChat(chatId)
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
              return (
                <MessageWrapper
                  key={key}
                  key2={key}
                  message={message as Message}
                  conversationType={
                    chat.type === C.DC_CHAT_TYPE_GROUP ? 'group' : 'direct'
                  }
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
