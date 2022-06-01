import React, { useRef, useCallback, useLayoutEffect } from 'react'
import { MessageWrapper } from './MessageWrapper'
import ChatStore, {
  useChatStore,
  ChatStoreState,
  ChatStoreStateWithChatSet,
  MessagePage,
} from '../../stores/chat'
import { useDebouncedCallback } from 'use-debounce'
import { C } from 'deltachat-node/node/dist/constants'
import type { ChatTypes } from 'deltachat-node'
import moment from 'moment'

import { getLogger } from '../../../shared/logger'
import { MessageType, FullChat } from '../../../shared/shared-types'
import { MessagesDisplayContext, useTranslationFunction } from '../../contexts'
import { KeybindAction, useKeyBindingAction } from '../../keybindings'
const log = getLogger('render/components/message/MessageList')

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
    scrollTo,
    scrollToBottom,
    scrollToBottomIfClose,
    lastKnownScrollHeight,
  } = useChatStore()
  const messageListRef = useRef<HTMLDivElement | null>(null)

  const [fetchMoreTop] = useDebouncedCallback(
    async () => {
      await ChatStore.effect.fetchMoreMessagesTop()
    },
    30,
    { leading: true }
  )

  const [fetchMoreBottom] = useDebouncedCallback(
    async () => {
      await ChatStore.effect.fetchMoreMessagesBottom()
    },
    30,
    { leading: true }
  )

  const onScroll = useCallback(
    (Event: React.UIEvent<HTMLDivElement> | null) => {
      if (!messageListRef.current) {
        return
      }
      if (ChatStore.lockIsLocked('scroll') === true) {
        //console.log('onScroll: locked, returning')
        return
      }
      const distanceToTop = messageListRef.current.scrollTop
      const distanceToBottom =
        messageListRef.current.scrollHeight -
        messageListRef.current.scrollTop -
        messageListRef.current.clientHeight
      //console.log('onScroll', distanceToTop, distanceToBottom)
      if (distanceToTop < 200 && distanceToBottom < 200) {
        log.debug('onScroll: Lets try loading messages from both ends')
        setTimeout(() => fetchMoreTop(), 0)
        setTimeout(() => fetchMoreBottom(), 0)
        Event?.preventDefault()
        Event?.stopPropagation()
        return false
      } else if (distanceToTop < 200) {
        log.debug('onScroll: Scrolled to top, fetching more messsages!')
        setTimeout(() => fetchMoreTop(), 0)
        Event?.preventDefault()
        Event?.stopPropagation()
        return false
      } else if (distanceToBottom < 200) {
        log.debug('onScroll: Scrolled to bottom, fetching more messsages!')
        setTimeout(() => fetchMoreBottom(), 0)
        Event?.preventDefault()
        Event?.stopPropagation()
        return false
      }
    },
    [fetchMoreTop, fetchMoreBottom]
  )

  useLayoutEffect(() => {
    if (!ChatStore.state.chat) {
      return
    }
    const chatId = ChatStore.state.chat.id
    if (!messageListRef.current) {
      return
    }
    if (scrollTo === null) {
      return
    }

    log.debug(
      'scrollTo: ' + scrollTo.type,
      messageListRef.current.scrollTop,
      messageListRef.current.scrollHeight
    )
    if (scrollTo.type === 'scrollToMessage') {
      log.debug('scrollTo: scrollToMessage: ' + scrollTo.msgId)

      const domElement = document.querySelector(
        `.message[id="${scrollTo.msgId.toString()}"]`
      )

      if (!domElement) {
        log.debug(
          'scrollTo: scrollToMessage, couldnt find matching message in dom, returning'
        )
        return
      }
      domElement.scrollIntoView()

      if (scrollTo.highlight === true) {
        // Trigger highlight animation
        const parentElement = domElement.parentElement
        if (parentElement !== null) {
          setTimeout(() => {
            // Retrigger animation
            parentElement.classList.add('highlight')
            parentElement.style.animation = 'none'
            parentElement.offsetHeight
            //@ts-ignore
            parentElement.style.animation = null
          }, 0)
        }
      }
      //
      //ChatStore.reducer.scrolledToBottom({ id: chatId })
      //lockFetchMore.setLock(false)
      // Try fetching more messages if needed
      setTimeout(() => {
        onScroll(null)
      }, 0)
      return
    } else if (scrollTo.type === 'scrollToLastKnownPosition') {
      log.debug(
        'scrollTo type: scrollToLastKnownPosition; lastKnownScrollHeight: ' +
          scrollTo.lastKnownScrollHeight +
          '; lastKnownScrollTop: ' +
          scrollTo.lastKnownScrollTop
      )

      if (scrollTo.appendedOn === 'top') {
        messageListRef.current.scrollTop =
          messageListRef.current.scrollHeight -
          scrollTo.lastKnownScrollHeight +
          scrollTo.lastKnownScrollTop
      } else {
        messageListRef.current.scrollTop = scrollTo.lastKnownScrollTop
      }
      setTimeout(() => {
        ChatStore.reducer.unlockScroll({ id: chatId })
        setTimeout(() => {
          onScroll(null)
        }, 0)
      }, 0)
    } else if (scrollTo.type === 'scrollToPosition') {
      log.debug(
        'scrollTo type: scrollToPosition; scrollTop: ' + scrollTo.scrollTop
      )
      messageListRef.current.scrollTop = scrollTo.scrollTop
      setTimeout(() => {
        ChatStore.reducer.unlockScroll({ id: chatId })
        setTimeout(() => {
          onScroll(null)
        }, 0)
      }, 0)
    }
  }, [onScroll, scrollTo])

  useLayoutEffect(() => {
    if (!ChatStore.state.chat) {
      return
    }
    const chatId = ChatStore.state.chat.id
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
      ChatStore.reducer.scrolledToBottom({ id: chatId })
      setTimeout(() => {
        onScroll(null)
      }, 0)
    }, 0)

    // Try fetching more messages if needed
  }, [onScroll, scrollToBottom])

  useLayoutEffect(() => {
    if (!ChatStore.state.chat) {
      return
    }
    const chatId = ChatStore.state.chat.id
    if (!messageListRef.current) {
      return
    }
    if (scrollToBottomIfClose === false) return
    const scrollHeight = lastKnownScrollHeight
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

    setTimeout(() => {
      ChatStore.reducer.scrolledToBottom({ id: chatId })
    }, 0)
  }, [scrollToBottomIfClose, lastKnownScrollHeight])

  useLayoutEffect(() => {
    if (!refComposer.current) {
      return
    }

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
        messageListRef.current.scrollTop =
          messageListRef.current.scrollTop - messageListRef.current.clientHeight
        // @ts-ignore
        onScroll(null)
      }
    })
    useKeyBindingAction(KeybindAction.MessageList_PageDown, () => {
      if (messageListRef.current) {
        messageListRef.current.scrollTop =
          messageListRef.current.scrollTop + messageListRef.current.clientHeight
        // @ts-ignore
        onScroll(null)
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

    for (let i = 0; i < messagesOnPage.length; i++) {
      const [messageId, message] = messagesOnPage[i]
      if (message === null || message == undefined) continue
      if (!message) {
        log.debug(`Missing message with id ${messageId}`)
        continue
      }
      if (messagePage.dayMarker.indexOf(messageId) !== -1) {
        messageElements.push(
          <DayMarker
            key={`daymarker-${messageId}`}
            timestamp={message?.timestamp || 0}
          />
        )
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

  if (chat.isGroup && !chat.isContactRequest) {
    emptyChatMessage = chat.isUnpromoted
      ? tx('chat_new_group_hint')
      : tx('chat_no_messages')
  } else if (chat.isSelfTalk) {
    emptyChatMessage = tx('saved_messages_explain')
  } else if (chat.isDeviceChat) {
    emptyChatMessage = tx('device_talk_explain')
  } else if (chat.isContactRequest) {
    emptyChatMessage = tx('chat_no_messages')
  }

  return (
    <li>
      <div className='info-message big'>
        <div className='bubble'>{emptyChatMessage}</div>
      </div>
    </li>
  )
}

export function DayMarker(props: { timestamp: number }) {
  const { timestamp } = props
  const tx = useTranslationFunction()
  return (
    <div className='info-message'>
      <div className='bubble' style={{ textTransform: 'capitalize' }}>
        {moment.unix(timestamp).calendar(null, {
          sameDay: `[${tx('today')}]`,
          lastDay: `[${tx('yesterday')}]`,
          lastWeek: 'LL',
          sameElse: 'LL',
        })}
      </div>
    </div>
  )
}
