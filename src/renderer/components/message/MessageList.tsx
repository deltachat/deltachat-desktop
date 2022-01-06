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
      if (!messageListRef.current) {
        return
      }
      const scrollHeight = messageListRef.current.scrollHeight
      ChatStore.effect.fetchMoreMessages(scrollHeight)
    },
    30,
    { leading: true }
  )

  const onScroll = useCallback(
    (Event: React.UIEvent<HTMLDivElement> | null) => {
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

  useEffect(() => {
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
    ChatStore.reducer.scrolledToBottom()

    // Try fetching more messages if needed
    onScroll(null)
  }, [onScroll, scrollToBottom])

  useEffect(() => {
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

    ChatStore.reducer.scrolledToBottom()
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
    ChatStore.reducer.scrolledToLastPage()
    isFetching.current = false
  }, [scrollToLastPage, scrollHeight])

  useEffect(() => {
    isFetching.current = false

    const composerTextarea = refComposer.current.childNodes[1]
    composerTextarea && composerTextarea.focus()
  }, [refComposer, chatStore.chat.id])

  useEffect(() => {
    if (!messageListRef.current) {
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
      oldestFetchedMessageIndex,
      messageIds,
      messagePages,
      messageListRef,

      chatStore,
    } = props

    if (!chatStore.chat.id) {
      throw new Error('no chat id')
    }

    const _messageIdsToShow = messageIdsToShow(
      oldestFetchedMessageIndex,
      messageIds
    )

    let specialMessageIdCounter = 0

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
          {messagePages.map((messagePage) => {
            return <MessagePageComponent messagePage={messagePage} conversationType={conversationType} />
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

const MessagePageComponent = React.memo(function MessagePageComponent({
  messagePage,
  conversationType
} : {
  messagePage: MessagePage,
  conversationType: ConversationType
}) {
  return (
    <div className="message-page" id={messagePage.pageKey}>
      {messagePage.messages.map((message: MessageType | null) => {
        if (message === null || message == undefined) return null
        const messageId = message.id
        if (messageId === C.DC_MSG_ID_DAYMARKER) {
          //const key = 'magic' + messageId + '_' + specialMessageIdCounter++
          // TODO
          const nextMessage = null
          //const nextMessage = messages[_messageIdsToShow[i + 1]]
          if (!nextMessage) return null
          //return <DayMarker key={key} timestamp={nextMessage.timestamp} />
        }
        if (!message) {
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
    </div>
  )
}, (prevPros, nextProps) => {
  const areEqual = 
    prevPros.messagePage.pageKey === nextProps.messagePage.pageKey &&
    prevPros.messagePage.messages === nextProps.messagePage.messages

  return areEqual
})

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
