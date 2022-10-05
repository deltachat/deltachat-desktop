import React, {
  useRef,
  useCallback,
  useLayoutEffect,
  MutableRefObject,
  useEffect,
  useState,
} from 'react'
import { MessageWrapper } from './MessageWrapper'
import ChatStore, {
  useChatStore,
  ChatStoreState,
  ChatStoreStateWithChatSet,
  MessagePage,
} from '../../stores/chat'
import { useDebouncedCallback } from 'use-debounce'
import debounce from 'debounce'
import { C } from 'deltachat-node/node/dist/constants'
import type { ChatTypes } from 'deltachat-node'
import moment from 'moment'

import { getLogger } from '../../../shared/logger'
import { MessagesDisplayContext, useTranslationFunction } from '../../contexts'
import { KeybindAction, useKeyBindingAction } from '../../keybindings'
import { BackendRemote } from '../../backend-com'
import { selectedAccountId } from '../../ScreenController'
import { debouncedUpdateBadgeCounter } from '../../system-integration/badge-counter'
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
  const [onePageAwayFromNewestMessage, _setOnePageAwayFromNewestMessage] = useState(false)
  const setOnePageAwayFromNewestMessage = debounce(_setOnePageAwayFromNewestMessage, 30, true)


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

  const onUnreadMessageInView: IntersectionObserverCallback = entries => {
    if (ChatStore.state.chat === null) return
    // Don't mark messages as read if window is not focused
    if (document.hasFocus() === false) return

    setTimeout(() => {
      log.debug(`onUnreadMessageInView: entries.length: ${entries.length}`)

      const messageIdsToMarkAsRead = []
      for (const entry of entries) {
        if (!entry.isIntersecting) continue
        const messageKey = entry.target.getAttribute('id')
        if (messageKey === null) continue
        const messageId = messageKey.split('-')[1]
        const messageHeight = entry.target.clientHeight

        log.debug(
          `onUnreadMessageInView: messageId ${messageId} height: ${messageHeight} intersectionRate: ${entry.intersectionRatio}`
        )
        log.debug(
          `onUnreadMessageInView: messageId ${messageId} marking as read`
        )

        messageIdsToMarkAsRead.push(Number.parseInt(messageId))
        if (unreadMessageInViewIntersectionObserver.current === null) continue
        unreadMessageInViewIntersectionObserver.current.unobserve(entry.target)
      }

      if (messageIdsToMarkAsRead.length > 0) {
        BackendRemote.rpc
          .markseenMsgs(selectedAccountId(), messageIdsToMarkAsRead)
          .then(debouncedUpdateBadgeCounter)
      }
    })
  }
  const unreadMessageInViewIntersectionObserver: MutableRefObject<IntersectionObserver> = useRef(
    new IntersectionObserver(onUnreadMessageInView, {
      root: null,
      rootMargin: '0px',
      threshold: [0, 1],
    })
  )

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    return () => {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      unreadMessageInViewIntersectionObserver.current?.disconnect()
    }
  }, [])

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

      const isNewestMessageLoaded = ChatStore.state.newestFetchedMessageIndex === ChatStore.state.messageIds.length - 1
      const onePageAwayFromNewestMessageTreshold = (messageListRef.current.clientHeight / 3)
      const onePageAwayFromNewestMessage = !isNewestMessageLoaded || distanceToBottom >= onePageAwayFromNewestMessageTreshold 
      setOnePageAwayFromNewestMessage(onePageAwayFromNewestMessage)

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
    [fetchMoreTop, fetchMoreBottom, setOnePageAwayFromNewestMessage]
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
  }, [onScroll, scrollToBottom, setOnePageAwayFromNewestMessage])

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

  const countUnreadMessages: number = chatStore.chat.freshMessageCounter
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
        unreadMessageInViewIntersectionObserver={
          unreadMessageInViewIntersectionObserver
        }
      />
      {(onePageAwayFromNewestMessage === true || countUnreadMessages > 0) && JumpDownButton({countUnreadMessages})}
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
    unreadMessageInViewIntersectionObserver: React.MutableRefObject<IntersectionObserver | null>
  }) => {
    const {
      onScroll,
      messageIds,
      messagePages,
      messageListRef,
      chatStore,
      unreadMessageInViewIntersectionObserver,
    } = props

    if (!chatStore.chat.id) {
      throw new Error('no chat id')
    }

    const conversationType: ConversationType = {
      hasMultipleParticipants:
        chatStore.chat.chatType === C.DC_CHAT_TYPE_GROUP ||
        chatStore.chat.chatType === C.DC_CHAT_TYPE_MAILINGLIST ||
        chatStore.chat.chatType === C.DC_CHAT_TYPE_BROADCAST,
      isDeviceChat: chatStore.chat.isDeviceChat as boolean,
      chatType: chatStore.chat.chatType as number,
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
                unreadMessageInViewIntersectionObserver={
                  unreadMessageInViewIntersectionObserver
                }
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
      prevProps.oldestFetchedMessageIndex === nextProps.oldestFetchedMessageIndex
    return areEqual
  }
)

function JumpDownButton({countUnreadMessages}: {countUnreadMessages: number}) {
  return ( 
    <>
      <div className='unread-message-counter'>
        <div
          className='counter'
          style={
            countUnreadMessages === 0 ? { visibility: 'hidden' } : {}
          }
        >
          {countUnreadMessages}
        </div>
        <div
          className='jump-to-bottom-button'
          onClick={() => {
            ChatStore.effect.jumpToMessage(undefined, true)
          }}
        >
          <div className='jump-to-bottom-icon' />
        </div>
      </div>
    </>
  )
}

const MessagePageComponent = React.memo(
  function MessagePageComponent({
    messagePage,
    conversationType,
    unreadMessageInViewIntersectionObserver,
  }: {
    messagePage: MessagePage
    conversationType: ConversationType
    unreadMessageInViewIntersectionObserver: React.MutableRefObject<IntersectionObserver | null>
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
        console.log('xxx', message.timestamp)
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
          key2={`${messageId}`}
          message={message}
          conversationType={conversationType}
          unreadMessageInViewIntersectionObserver={
            unreadMessageInViewIntersectionObserver
          }
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
  const chat = chatStore.chat

  if (!chat) {
    throw new Error('no chat selected')
  }

  let emptyChatMessage = tx('chat_new_one_to_one_hint', [chat.name, chat.name])

  if (chat.chatType === C.DC_CHAT_TYPE_BROADCAST) {
    emptyChatMessage = tx('chat_new_broadcast_hint')
  } else if (chat.chatType === C.DC_CHAT_TYPE_GROUP && !chat.isContactRequest) {
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
