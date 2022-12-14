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
  ChatStoreStateWithChatSet,
} from '../../stores/chat'
import { C } from '@deltachat/jsonrpc-client'
import type { ChatTypes } from 'deltachat-node'
import moment from 'moment'

import { getLogger } from '../../../shared/logger'
import { MessagesDisplayContext, useTranslationFunction } from '../../contexts'
import { KeybindAction, useKeyBindingAction } from '../../keybindings'
import { T } from '@deltachat/jsonrpc-client'
import { selectedAccountId } from '../../ScreenController'
import { useMessageList } from '../../stores/messagelist'
import { BackendRemote, onDCEvent } from '../../backend-com'
import { debouncedUpdateBadgeCounter } from '../../system-integration/badge-counter'
const log = getLogger('render/components/message/MessageList')

const onWindowFocus = (accountId: number) => {
  log.debug('window focused')
  const messageElements = Array.prototype.slice.call(
    document.querySelectorAll('#message-list .message-observer-bottom')
  )

  const visibleElements = messageElements.filter(el => {
    const rect = el.getBoundingClientRect()
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <=
        (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    )
  })

  const messageIdsToMarkAsRead = visibleElements.map(el =>
    Number.parseInt(el.getAttribute('id').split('-')[1])
  )

  if (messageIdsToMarkAsRead.length !== 0) {
    log.debug(
      `window was focused: marking ${messageIdsToMarkAsRead.length} visible messages as read`,
      messageIdsToMarkAsRead
    )
    BackendRemote.rpc
      .markseenMsgs(accountId, messageIdsToMarkAsRead)
      .then(debouncedUpdateBadgeCounter)
  }
}

function useUnreadCount(
  accountId: number,
  chatId: number,
  initialValue: number
) {
  const [freshMessageCounter, setFreshMessageCounter] = useState(initialValue)

  useEffect(() => {
    const update = async ({ chatId: eventChatId }: { chatId: number }) => {
      if (chatId === eventChatId) {
        const count = await BackendRemote.rpc.getFreshMsgCnt(accountId, chatId)
        setFreshMessageCounter(count)
      }
    }

    const cleanup = [
      onDCEvent(accountId, 'IncomingMsg', update),
      onDCEvent(accountId, 'MsgRead', update),
      onDCEvent(accountId, 'MsgsNoticed', update),
    ]
    return () => cleanup.forEach(off => off())
  }, [accountId, chatId])

  return freshMessageCounter
}

export default function MessageList({
  chatStore,
  refComposer,
}: {
  chatStore: ChatStoreStateWithChatSet
  refComposer: todo
}) {
  const accountId = selectedAccountId()
  const {
    store: {
      scheduler,
      effect: { jumpToMessage },
      reducer: { unlockScroll, clearJumpStack },
      activeView,
    },
    state: {
      oldestFetchedMessageListItemIndex,
      newestFetchedMessageListItemIndex,
      messageCache,
      messageListItems,
      viewState,
      jumpToMessageStack,
      loaded,
    },
    fetchMoreBottom,
    fetchMoreTop,
  } = useMessageList(accountId, chatStore.chat.id)

  const countUnreadMessages = useUnreadCount(
    accountId,
    chatStore.chat.id,
    chatStore.chat.freshMessageCounter
  )

  const messageListRef = useRef<HTMLDivElement | null>(null)
  const [showJumpDownButton, setShowJumpDownButton] = useState(false)

  const onUnreadMessageInView: IntersectionObserverCallback = entries => {
    if (ChatStore.state.chat === null) return
    // Don't mark messages as read if window is not focused
    if (document.hasFocus() === false) return

    if (scheduler.isLocked('scroll') === true) {
      //console.log('onScroll: locked, returning')
      return
    }

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
        const chatId = ChatStore.state.chat?.id
        if (!chatId) return
        BackendRemote.rpc
          .markseenMsgs(accountId, messageIdsToMarkAsRead)
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

  useEffect(() => {
    const onFocus = onWindowFocus.bind(null, accountId)
    window.addEventListener('focus', onFocus)
    return () => window.removeEventListener('focus', onFocus)
  }, [accountId])

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    return () => {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      unreadMessageInViewIntersectionObserver.current?.disconnect()
    }
  }, [])

  useEffect(() => {
    window.__internal_jump_to_message = jumpToMessage
    return () => {
      window.__internal_jump_to_message = undefined
    }
  }, [jumpToMessage])

  const onScroll = useCallback(
    (Event: React.UIEvent<HTMLDivElement> | null) => {
      if (!messageListRef.current) {
        return
      }
      if (scheduler.isLocked('scroll') === true) {
        //console.log('onScroll: locked, returning')
        return
      }
      const distanceToTop = messageListRef.current.scrollTop
      const distanceToBottom =
        messageListRef.current.scrollHeight -
        messageListRef.current.scrollTop -
        messageListRef.current.clientHeight

      const isNewestMessageLoaded =
        newestFetchedMessageListItemIndex === messageListItems.length - 1
      const newShowJumpDownButton =
        !isNewestMessageLoaded ||
        distanceToBottom >= 10 /* 10 is close enough to 0 */
      if (newShowJumpDownButton != showJumpDownButton) {
        setShowJumpDownButton(newShowJumpDownButton)
      }
      if (!newShowJumpDownButton) {
        clearJumpStack()
      }

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
    [
      fetchMoreTop,
      fetchMoreBottom,
      setShowJumpDownButton,
      showJumpDownButton,
      newestFetchedMessageListItemIndex,
      messageListItems.length,
      scheduler,
      clearJumpStack,
    ]
  )

  useLayoutEffect(() => {
    if (!ChatStore.state.chat) {
      return
    }
    if (!messageListRef.current) {
      return
    }
    if (viewState.scrollTo === null) {
      return
    }

    const { scrollTo, lastKnownScrollHeight } = viewState

    log.debug(
      'scrollTo: ' + scrollTo.type,
      'scrollTop:',
      messageListRef.current.scrollTop,
      'scrollHeight:',
      messageListRef.current.scrollHeight
    )
    if (scrollTo.type === 'scrollToMessage') {
      log.debug('scrollTo: scrollToMessage: ' + scrollTo.msgId)

      let domElement = document.querySelector(
        `.message[id="${scrollTo.msgId.toString()}"]`
      )
      if (!domElement) {
        domElement = document.querySelector(
          `.info-message[id="${scrollTo.msgId.toString()}"]`
        )
      }

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
    } else if (scrollTo.type === 'scrollToPosition') {
      log.debug(
        'scrollTo type: scrollToPosition; scrollTop: ' + scrollTo.scrollTop
      )
      messageListRef.current.scrollTop = scrollTo.scrollTop
    } else if (scrollTo.type === 'scrollToBottom') {
      if (scrollTo.ifClose === true) {
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
      } else {
        log.debug(
          'scrollToBottom',
          messageListRef.current.scrollTop,
          messageListRef.current.scrollHeight
        )
        messageListRef.current.scrollTop = messageListRef.current.scrollHeight
      }
    }
    setTimeout(() => {
      unlockScroll()
      setTimeout(() => {
        onScroll(null)
      }, 0)
    }, 0)
  }, [
    onScroll,
    viewState,
    viewState.scrollTo,
    viewState.lastKnownScrollHeight,
    unlockScroll,
  ])

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
        oldestFetchedMessageIndex={oldestFetchedMessageListItemIndex}
        messageListItems={messageListItems}
        activeView={activeView}
        messageCache={messageCache}
        messageListRef={messageListRef}
        chatStore={chatStore}
        loaded={loaded}
        unreadMessageInViewIntersectionObserver={
          unreadMessageInViewIntersectionObserver
        }
      />
      {showJumpDownButton && (
        <JumpDownButton
          countUnreadMessages={countUnreadMessages}
          jumpToMessage={jumpToMessage}
          jumpToMessageStack={jumpToMessageStack}
        />
      )}
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
    messageListItems: T.MessageListItem[]
    activeView: T.MessageListItem[]
    messageCache: { [msgId: number]: T.Message }
    messageListRef: React.MutableRefObject<HTMLDivElement | null>
    chatStore: ChatStoreStateWithChatSet
    loaded: boolean
    unreadMessageInViewIntersectionObserver: React.MutableRefObject<IntersectionObserver | null>
  }) => {
    const {
      onScroll,
      messageListItems,
      messageCache,
      activeView,
      messageListRef,
      chatStore,
      loaded,
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

    if (!loaded) {
      return (
        <div id='message-list' ref={messageListRef} onScroll={onScroll}>
          <ul></ul>
        </div>
      )
    }

    return (
      <div id='message-list' ref={messageListRef} onScroll={onScroll}>
        <ul>
          {messageListItems.length === 0 && <EmptyChatMessage />}
          {activeView.map(messageId => {
            if (messageId.kind === 'dayMarker') {
              return (
                <DayMarker
                  key={`daymarker-${messageId.timestamp}`}
                  timestamp={messageId.timestamp}
                />
              )
            }

            if (messageId.kind === 'message') {
              const message = messageCache[messageId.msg_id]
              if (message) {
                return (
                  <MessageWrapper
                    key={messageId.msg_id}
                    key2={`${messageId.msg_id}`}
                    message={message as T.Message}
                    conversationType={conversationType}
                    unreadMessageInViewIntersectionObserver={
                      unreadMessageInViewIntersectionObserver
                    }
                  />
                )
              } else {
                return (
                  <div className='info-message' id={String(messageId.msg_id)}>
                    <div
                      className='bubble'
                      style={{
                        textTransform: 'capitalize',
                        backgroundColor: 'rgba(55,0,0,0.5)',
                      }}
                    >
                      Message with id {messageId.msg_id} was not found in cache.
                      Select a different chat, then this chat again to fix it.
                      We are working on a better solution.
                    </div>
                  </div>
                )
              }
            }
          })}
        </ul>
      </div>
    )
  },
  (prevProps, nextProps) => {
    const areEqual: boolean =
      prevProps.activeView === nextProps.activeView &&
      prevProps.messageCache === nextProps.messageCache &&
      prevProps.oldestFetchedMessageIndex ===
        nextProps.oldestFetchedMessageIndex &&
      prevProps.onScroll === nextProps.onScroll
    return areEqual
  }
)

function JumpDownButton({
  countUnreadMessages,
  jumpToMessage,
  jumpToMessageStack,
}: {
  countUnreadMessages: number
  jumpToMessage: (
    msgId: number | undefined,
    highlight?: boolean,
    addMessageIdToStack?: undefined | number
  ) => Promise<void>
  jumpToMessageStack: number[]
}) {
  return (
    <>
      <div className='jump-down-button'>
        <div
          className='counter'
          style={countUnreadMessages === 0 ? { visibility: 'hidden' } : {}}
        >
          {countUnreadMessages}
        </div>
        <div
          className='button'
          onClick={() => {
            jumpToMessage(undefined, true)
          }}
        >
          <div
            className={
              'icon ' + (jumpToMessageStack.length > 0 ? 'back' : 'down')
            }
          />
        </div>
      </div>
    </>
  )
}

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
    <div className='info-message daymarker'>
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
