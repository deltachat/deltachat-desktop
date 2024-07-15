import React, {
  useRef,
  useCallback,
  useLayoutEffect,
  MutableRefObject,
  useEffect,
  useState,
  useMemo,
} from 'react'
import classNames from 'classnames'
import moment from 'moment'
import { C } from '@deltachat/jsonrpc-client'
import { debounce } from 'debounce'

import { MessageWrapper } from './MessageWrapper'
import { getLogger } from '../../../../shared/logger'
import { KeybindAction } from '../../keybindings'
import { useMessageList } from '../../stores/messagelist'
import { BackendRemote, onDCEvent } from '../../backend-com'
import { debouncedUpdateBadgeCounter } from '../../system-integration/badge-counter'
import { MessagesDisplayContext } from '../../contexts/MessagesDisplayContext'
import useTranslationFunction from '../../hooks/useTranslationFunction'
import useKeyBindingAction from '../../hooks/useKeyBindingAction'
import useHasChanged from '../../hooks/useHasChanged'
import { useReactionsBar } from '../ReactionsBar'
import EmptyChatMessage from './EmptyChatMessage'

const log = getLogger('render/components/message/MessageList')

import type { T } from '@deltachat/jsonrpc-client'

type ChatTypes =
  | C.DC_CHAT_TYPE_SINGLE
  | C.DC_CHAT_TYPE_GROUP
  | C.DC_CHAT_TYPE_BROADCAST
  | C.DC_CHAT_TYPE_MAILINGLIST
  | C.DC_CHAT_TYPE_UNDEFINED

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

type Props = {
  accountId: number
  chat: T.FullChat
  refComposer: any
}

export default function MessageList({ accountId, chat, refComposer }: Props) {
  const {
    store: {
      scheduler,
      effect: { jumpToMessage, loadMissingMessages },
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
  } = useMessageList(accountId, chat.id)
  const { hideReactionsBar, isReactionsBarShown } = useReactionsBar()

  const countUnreadMessages = useUnreadCount(
    accountId,
    chat.id,
    chat.freshMessageCounter
  )

  const messageListRef = useRef<HTMLDivElement | null>(null)
  const [showJumpDownButton, setShowJumpDownButton] = useState(false)

  const onUnreadMessageInView: IntersectionObserverCallback = entries => {
    if (!chat) return
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
        const chatId = chat?.id
        if (!chatId) return
        BackendRemote.rpc
          .markseenMsgs(accountId, messageIdsToMarkAsRead)
          .then(debouncedUpdateBadgeCounter)
      }
    })
  }
  const unreadMessageInViewIntersectionObserver: MutableRefObject<IntersectionObserver> =
    useRef(
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
    (ev: React.UIEvent<HTMLDivElement> | null) => {
      if (!messageListRef.current) {
        return
      }
      if (scheduler.isLocked('scroll') === true) {
        return
      }

      if (ev) hideReactionsBar()

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

      if (distanceToTop < 200 && distanceToBottom < 200) {
        log.debug('onScroll: Lets try loading messages from both ends')
        setTimeout(() => fetchMoreTop(), 0)
        setTimeout(() => fetchMoreBottom(), 0)
        ev?.preventDefault()
        ev?.stopPropagation()
        return false
      } else if (distanceToTop < 200) {
        log.debug('onScroll: Scrolled to top, fetching more messages!')
        setTimeout(() => fetchMoreTop(), 0)
        ev?.preventDefault()
        ev?.stopPropagation()
        return false
      } else if (distanceToBottom < 200) {
        log.debug('onScroll: Scrolled to bottom, fetching more messages!')
        setTimeout(() => fetchMoreBottom(), 0)
        ev?.preventDefault()
        ev?.stopPropagation()
        return false
      }
    },
    [
      clearJumpStack,
      fetchMoreBottom,
      fetchMoreTop,
      hideReactionsBar,
      messageListItems.length,
      newestFetchedMessageListItemIndex,
      scheduler,
      setShowJumpDownButton,
      showJumpDownButton,
    ]
  )

  useLayoutEffect(() => {
    if (!chat) {
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
      messageListRef.current.scrollHeight,
      'reactionsBar:',
      isReactionsBarShown
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
        domElement = document.querySelector(
          `.videochat-invitation[id="${scrollTo.msgId.toString()}"]`
        )
      }

      if (!domElement) {
        log.debug(
          "scrollTo: scrollToMessage, couldn't find matching message in dom, returning"
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
    } else if (scrollTo.type === 'scrollToBottom' && !isReactionsBarShown) {
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
    chat,
    onScroll,
    unlockScroll,
    viewState,
    viewState.lastKnownScrollHeight,
    viewState.scrollTo,
    isReactionsBarShown,
  ])

  useLayoutEffect(() => {
    if (!refComposer.current) {
      return
    }

    const composerTextarea = refComposer.current.childNodes[1]
    composerTextarea && composerTextarea.focus()
  }, [refComposer, chat.id])

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
      value={{
        context: 'chat_messagelist',
        chatId: chat.id,
        isDeviceChat: chat.isDeviceChat,
      }}
    >
      <MessageListInner
        onScroll={onScroll}
        oldestFetchedMessageIndex={oldestFetchedMessageListItemIndex}
        messageListItems={messageListItems}
        activeView={activeView}
        messageCache={messageCache}
        messageListRef={messageListRef}
        chat={chat}
        loaded={loaded}
        unreadMessageInViewIntersectionObserver={
          unreadMessageInViewIntersectionObserver
        }
        loadMissingMessages={loadMissingMessages}
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
    messageCache: { [msgId: number]: T.MessageLoadResult | undefined }
    messageListRef: React.MutableRefObject<HTMLDivElement | null>
    chat: T.FullChat
    loaded: boolean
    unreadMessageInViewIntersectionObserver: React.MutableRefObject<IntersectionObserver | null>
    loadMissingMessages: () => Promise<void>
  }) => {
    const {
      onScroll,
      messageListItems,
      messageCache,
      activeView,
      messageListRef,
      chat,
      loaded,
      unreadMessageInViewIntersectionObserver,
      loadMissingMessages,
    } = props

    const conversationType: ConversationType = {
      hasMultipleParticipants:
        chat.chatType === C.DC_CHAT_TYPE_GROUP ||
        chat.chatType === C.DC_CHAT_TYPE_MAILINGLIST ||
        chat.chatType === C.DC_CHAT_TYPE_BROADCAST,
      isDeviceChat: chat.isDeviceChat as boolean,
      chatType: chat.chatType as number,
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

    // This fixes bad FPS when scrolling the chat on some devices,
    // e.g. on one of mine, Windows with a not-good GPU.
    //
    // About the issue: if you open dev tools and record performance while
    // endlessly scrolling a chat, you'll see dropped frames.
    // For me it was ~every second frame, and sometimes it's 4 / 5 frames.
    // It's not scripting, but GPU seems to be the bottleneck:
    // it's almost constantly busy.
    // When `will-change: scroll-position;` is added, GPU seems to still be
    // involved on every frame (unlike it seems to be on regular websites),
    // but it takes significantly less than my monitor's refresh period,
    // thus no frames are dropped.
    // Another thing is if you check "Scrolling performance issues" on the
    // "rendering" tab, it tells you that the `#message-list`
    // "repaints on scroll". This goes away once you add
    // `will-change: scroll-position;`
    //
    // Note, however, that this disables subpixel antialiasing
    // (makes text blurrier):
    // - https://stackoverflow.com/questions/24741502/can-i-do-anything-about-repaints-on-scroll-warning-in-chrome-for-overflowscr/32744881#32744881
    // - https://dev.opera.com/articles/css-will-change-property#does-will-change-affect-the-element-it-is-applied-to-beyond-hinting-the-browser-about-the-changes-to-that-element
    // This is the main reason why we're adding/removing it dynamically
    // and not just set it in style sheets.
    // Though perhaps it's not ideal to set `will-change` only when the user
    // starts scrolling, because it takes time for the optimization to
    // take effect, but I couldn't come up with a better time to apply it.
    //
    // TODO maybe there is a different, more "proper" way to fix this.
    // E.g. tinker with `position: absolte`, `z-index` or something IDK.
    // [MDN docs say](https://developer.mozilla.org/en-US/docs/Web/CSS/will-change):
    // > `will-change` is intended to be used as a last resort
    const [scrolledRecently, setScrolledRecently] = useState(false)
    const debouncedResetScrolledRecently = useMemo(
      () => debounce(() => setScrolledRecently(false), 3000),
      []
    )
    const onScroll2 = (...args: Parameters<typeof onScroll>) => {
      const switchedChatRecently = Date.now() - switchedChatAt < 200
      // Ignore scrolls that are not caused by the user, because this
      // gives no indication as to whether they're gonna scroll soon.
      // Maybe they're just jumping between chats.
      const isScrollProgrammatic = switchedChatRecently
      if (!isScrollProgrammatic) {
        setScrolledRecently(true)
        debouncedResetScrolledRecently()
      }

      onScroll(...args)
    }
    const hasChatChanged = useHasChanged(chat)
    const [switchedChatAt, setSwitchedChatAt] = useState(0)
    useEffect(() => {
      if (hasChatChanged) {
        setSwitchedChatAt(Date.now())
      }
    }, [hasChatChanged])

    if (!loaded) {
      return (
        <div id='message-list' ref={messageListRef} onScroll={onScroll2}>
          <ul></ul>
        </div>
      )
    }

    return (
      <div
        id='message-list'
        ref={messageListRef}
        onScroll={onScroll2}
        style={{
          willChange: scrolledRecently ? 'scroll-position' : undefined,
        }}
      >
        <ul>
          {messageListItems.length === 0 && <EmptyChatMessage chat={chat} />}
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
              if (message?.kind === 'message') {
                return (
                  <MessageWrapper
                    key={messageId.msg_id}
                    key2={`${messageId.msg_id}`}
                    chat={chat}
                    message={message}
                    conversationType={conversationType}
                    unreadMessageInViewIntersectionObserver={
                      unreadMessageInViewIntersectionObserver
                    }
                  />
                )
              } else if (message?.kind === 'loadingError') {
                return (
                  <div className='info-message' id={String(messageId.msg_id)}>
                    <div
                      className='bubble'
                      style={{
                        backgroundColor: 'rgba(55,0,0,0.5)',
                      }}
                    >
                      loading message {messageId.msg_id} failed: {message.error}
                    </div>
                  </div>
                )
              } else {
                // setTimeout tells it to call method in next event loop iteration, so after rendering
                // it is debounced later so we can call it here multiple times and it's ok
                setTimeout(loadMissingMessages)
                return (
                  <div className='info-message' id={String(messageId.msg_id)}>
                    <div
                      className='bubble'
                      style={{
                        backgroundColor: 'rgba(55,0,0,0.5)',
                      }}
                    >
                      Loading Message {messageId.msg_id}
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
  let countToShow: string = countUnreadMessages.toString()
  if (countUnreadMessages > 99) {
    countToShow = '99+'
  }

  return (
    <>
      <div className='jump-down-button'>
        <div
          className={classNames(
            'counter',
            countToShow.length === 3 && 'counter-3digits'
          )}
          style={countUnreadMessages === 0 ? { visibility: 'hidden' } : {}}
        >
          {countToShow}
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
