import React, { useRef, useEffect, useCallback, useLayoutEffect } from 'react'
import { MessageWrapper } from './MessageWrapper'
import ChatStore, {
  useChatStore,
  ChatStoreState,
  ChatStoreStateWithChatSet,
  MessagePage,
} from '../../stores/chat'
import { useDebouncedCallback } from 'use-debounce'
import { C } from 'deltachat-node/dist/constants'
import type { ChatTypes } from 'deltachat-node'
import moment from 'moment'

import { getLogger } from '../../../shared/logger'
import { MessageType, FullChat } from '../../../shared/shared-types'
import { MessagesDisplayContext, useTranslationFunction } from '../../contexts'
import { useDCConfigOnce } from '../helpers/useDCConfigOnce'
import { KeybindAction, useKeyBindingAction } from '../../keybindings'
const log = getLogger('render/msgList')

export default function MessageList({
  chatStore,
  refComposer,
}: {
  chatStore: ChatStoreStateWithChatSet
  refComposer: todo
}) {
  const {
    oldestFetchedMessageIndex,
    messagePages,
    messageIds,
    scrollToBottom,
    scrollToBottomIfClose,
    scrollToLastPage,
    scrollHeight,
  } = useChatStore()
  const messageListRef = useRef<HTMLDivElement | null>(null)
  const lastKnownScrollHeight = useRef<number>(0)
  const lastKnownScrollTop = useRef<number>(0)
  const isFetching = useRef(false)

  const [fetchMore] = useDebouncedCallback(
    () => {
      ChatStore.effect.fetchMoreMessages()
    },
    30,
    { leading: true }
  )

  const onScroll = useCallback(
    (Event: React.UIEvent<HTMLDivElement> | null) => {
      if (isFetching.current === true) {
        return
      }
      if (!messageListRef.current) {
        return
      }
      ;(lastKnownScrollHeight.current as any) = messageListRef.current.scrollHeight
      ;(lastKnownScrollTop.current as any) = messageListRef.current.scrollTop
      if (messageListRef.current.scrollTop > 200) return
      if (isFetching.current === false) {
        isFetching.current = true
        log.debug('Scrolled to top, fetching more messsages!')
        fetchMore()
      }
      Event?.preventDefault()
      Event?.stopPropagation()
      return false
    },
    [fetchMore]
  )

  useLayoutEffect(() => {
    if (!messageListRef.current) {
      return
    }
    if (scrollToBottom === false) {
      return
    }

    log.debug(
      'scrollToBottom',
      messageListRef.current.scrollTop,
      messageListRef.current.scrollHeight
    )
    messageListRef.current.scrollTop = messageListRef.current.scrollHeight
    setTimeout(() => {
      ChatStore.reducer.scrolledToBottom(), 0

      // Try fetching more messages if needed
      onScroll(null)
    })
  }, [onScroll, scrollToBottom])

  useLayoutEffect(() => {
    if (!messageListRef.current) {
      return
    }
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

    setTimeout(() => ChatStore.reducer.scrolledToBottom(), 0)
  }, [scrollToBottomIfClose])

  useLayoutEffect(() => {
    if (!messageListRef.current) {
      return
    }
    if (scrollToLastPage === false) return
    // restore old scroll position after new messages are rendered
    messageListRef.current.scrollTop =
      messageListRef.current.scrollHeight -
      lastKnownScrollHeight.current +
      lastKnownScrollTop.current
    isFetching.current = false
    setTimeout(() => ChatStore.reducer.scrolledToLastPage(), 0)
  }, [scrollToLastPage, scrollHeight])

  useEffect(() => {
    isFetching.current = false

    const composerTextarea = refComposer.current.childNodes[1]
    composerTextarea && composerTextarea.focus()
  }, [refComposer, chatStore.chat.id])

  useLayoutEffect(() => {
    if (!messageListRef.current || !refComposer.current) {
      return
    }
    const composerTextarea = refComposer.current.childNodes[1]
    composerTextarea && composerTextarea.focus()
    messageListRef.current.scrollTop = messageListRef.current.scrollHeight
  }, [refComposer])

  return (
    <MessagesDisplayContext.Provider
      value={{ context: 'chat_messagelist', chatId: chatStore.chat.id }}
    >
      <MessageListInner
        onScroll={onScroll}
        oldestFetchedMessageIndex={oldestFetchedMessageIndex}
        messageIds={messageIds}
        messagePages={messagePages}
        messageListRef={messageListRef}
        chatStore={chatStore}
      />
    </MessagesDisplayContext.Provider>
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
    messagePages: ChatStoreState['messagePages']
    messageListRef: React.MutableRefObject<HTMLDivElement | null>
    chatStore: ChatStoreStateWithChatSet
  }) => {
    const {
      onScroll,
      messageIds,
      messagePages,
      messageListRef,

      chatStore,
    } = props

    if (!chatStore.chat.id) {
      throw new Error('no chat id')
    }

    const conversationType: ConversationType = {
      hasMultipleParticipants:
        chatStore.chat.type === C.DC_CHAT_TYPE_GROUP ||
        chatStore.chat.type === C.DC_CHAT_TYPE_MAILINGLIST,
      isDeviceChat: chatStore.chat.isDeviceChat as boolean,
      chatType: chatStore.chat.type as number,
    }

    useKeyBindingAction(KeybindAction.MessageList_PageUp, () => {
      if (messageListRef.current) {
        messageListRef.current.scrollBy({
          top: -messageListRef.current.clientHeight,
          behavior: 'auto',
        })
      }
    })
    useKeyBindingAction(KeybindAction.MessageList_PageDown, () => {
      if (messageListRef.current) {
        messageListRef.current.scrollBy({
          top: messageListRef.current.clientHeight,
          behavior: 'auto',
        })
      }
    })

    return (
      <div id='message-list' ref={messageListRef} onScroll={onScroll}>
        <ul>
          {messageIds.length === 0 && <EmptyChatMessage />}
          {messagePages.map(messagePage => {
            return (
              <MessagePageComponent
                key={messagePage.pageKey}
                messagePage={messagePage}
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
      prevProps.messagePages === nextProps.messagePages &&
      prevProps.oldestFetchedMessageIndex ===
        nextProps.oldestFetchedMessageIndex

    return areEqual
  }
)

const MessagePageComponent = React.memo(
  function MessagePageComponent({
    messagePage,
    conversationType,
  }: {
    messagePage: MessagePage
    conversationType: ConversationType
  }) {
    const messageElements = []
    const messagesOnPage = messagePage.messages.toArray()

    let specialMessageIdCounter = 0
    for (let i = 0; i < messagesOnPage.length; i++) {
      const [messageId, message] = messagesOnPage[i]
      if (messageId === C.DC_MSG_ID_DAYMARKER) {
        if (i == messagesOnPage.length - 1) continue // next Message is not on this page, we for now justt skip rendering this daymarker.
        const [_nextMessageId, nextMessage] = messagesOnPage[i + 1]
        if (!nextMessage) continue
        const key = 'magic' + messageId + '_' + specialMessageIdCounter++
        messageElements.push(
          <DayMarker key={key} timestamp={nextMessage.timestamp} />
        )
      }
      if (message === null || message == undefined) continue
      if (!message) {
        log.debug(`Missing message with id ${messageId}`)
        continue
      }
      messageElements.push(
        <MessageWrapper
          key={messageId}
          message={message as MessageType}
          conversationType={conversationType}
        />
      )
    }

    return (
      <div className='message-page' id={messagePage.pageKey}>
        {messageElements}
      </div>
    )
  },
  (prevProps, nextProps) => {
    const areEqual =
      prevProps.messagePage.pageKey === nextProps.messagePage.pageKey &&
      prevProps.messagePage.messages === nextProps.messagePage.messages

    return areEqual
  }
)

function EmptyChatMessage() {
  const tx = useTranslationFunction()
  const chatStore = useChatStore()
  const chat = chatStore.chat as FullChat

  let emptyChatMessage = tx('chat_new_one_to_one_hint', [chat.name, chat.name])

  const showAllEmail = useDCConfigOnce('show_emails')

  if (chat.isGroup && !chat.isContactRequest) {
    emptyChatMessage = chat.isUnpromoted
      ? tx('chat_new_group_hint')
      : tx('chat_no_messages')
  } else if (chat.isSelfTalk) {
    emptyChatMessage = tx('saved_messages_explain')
  } else if (chat.isDeviceChat) {
    emptyChatMessage = tx('device_talk_explain')
  } else if (chat.isContactRequest) {
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
