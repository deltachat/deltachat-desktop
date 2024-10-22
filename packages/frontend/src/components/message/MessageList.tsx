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

  /**
   * If scroll distance to bottom is bigger than this, we'll show
   * the "scroll to bottom" button and not scroll new messages into view.
   */
  const maxScrollToBottomDistanceConsideredShort = 10

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

  const pendingProgrammaticSmoothScrollTo = useRef<null | number>(null)
  const pendingProgrammaticSmoothScrollTimeout = useRef<number>(-1)

  const onScroll = useCallback(
    (ev: React.UIEvent<HTMLDivElement> | null) => {
      if (!messageListRef.current) {
        return
      }
      if (scheduler.isLocked('scroll') === true) {
        return
      }

      // We might call `onScroll` manually with `null` argument.
      // We only want to hide the reactions bar when _the user_ scrolls,
      // intentionally.
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
        distanceToBottom > maxScrollToBottomDistanceConsideredShort
      if (newShowJumpDownButton != showJumpDownButton) {
        setShowJumpDownButton(newShowJumpDownButton)
      }
      if (!newShowJumpDownButton) {
        clearJumpStack()
      }

      // Remember that `distanceToTop` and `distanceToBottom` can both be true.
      if (distanceToTop < 800) {
        // Prevent the scroll position from "sticking" to the top,
        // which would disable scroll anchoring, and would make
        // the scroll position continuosuly jump to the very top and we'd
        // continuously load older messages without the user scrolling.
        //
        // See https://drafts.csswg.org/css-scroll-anchoring/#suppression-triggers
        // > A suppression trigger is an operation that suppresses
        // > the scroll anchoring
        // > ...
        // > The scroll offset of the scrollable element being zero.
        if (distanceToTop < 3) {
          messageListRef.current.scrollTop = 3
        }

        log.debug('onScroll: Scrolled to top, fetching more messages!')
        setTimeout(() => fetchMoreTop(), 0)
      }
      if (distanceToBottom < 800) {
        log.debug('onScroll: Scrolled to bottom, fetching more messages!')
        setTimeout(() => fetchMoreBottom(), 0)
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
  const onScrollEnd = useCallback((_ev: Event) => {
    clearTimeout(pendingProgrammaticSmoothScrollTimeout.current)
    pendingProgrammaticSmoothScrollTo.current = null
  }, [])

  // This `useLayoutEffect` is made to run whenever `viewState` changes.
  // `viewState` controls the desired scroll position of `messageListRef`.
  // After the following callback is run and the message list is scrolled
  // to where `viewState` told it to be, we reset `viewState` back to `null`.
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

    if (pendingProgrammaticSmoothScrollTo.current != null) {
      // Let's finish the pending scroll immediately
      // so that our further calculations that are based on `scrollTop`
      // (e.g. whether we're close to the bottom (`ifClose`)) are correct.
      //
      // FYI instead of interrupting the pending scroll, we could
      // postpone calling `unlockScroll` when initiating a smooth scroll
      // until the said scroll finishes (see `scheduler.lockedQueuedEffect()`).
      // This would queue new scrollTo "events" until after
      // the smooth scroll finishes.
      log.debug(
        'New viewState received, but a previous programmatic smooth scroll ' +
          "is pending. Let's finish the pending one immediately. " +
          `Scrolling to ${pendingProgrammaticSmoothScrollTo.current}`
      )
      messageListRef.current.scrollTop =
        pendingProgrammaticSmoothScrollTo.current
      clearTimeout(pendingProgrammaticSmoothScrollTimeout.current)
      pendingProgrammaticSmoothScrollTo.current = null

      // But keep in mind that we record `lastKnownScrollTop`
      // in `chat_view_reducer`, and that recording could happen during
      // a pending smooth scroll.
      // This does not appear to matter though. We don't use
      // `lastKnownScrollTop` too much.
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

      const domElement = document.getElementById(scrollTo.msgId.toString())
      if (!domElement) {
        log.error(
          "scrollTo: scrollToMessage, couldn't find matching message in dom, returning",
          domElement
        )
        return
      }
      if (
        !domElement.classList.contains('message') &&
        !domElement.classList.contains('info-message') &&
        !domElement.classList.contains('videochat-invitation') &&
        // Currently we have the same `id=` set on both `<li>` and its child.
        !domElement.firstElementChild?.classList.contains('message') &&
        !domElement.firstElementChild?.classList.contains('info-message') &&
        !domElement.firstElementChild?.classList.contains(
          'videochat-invitation'
        )
      ) {
        log.warn(
          `scrollTo: scrollToMessage, found an element with ` +
            `id=${scrollTo.msgId}, but it's not a message:`,
          domElement
        )
      }

      domElement.scrollIntoView({
        // "nearest" so as to not scroll if the message is already in view.
        // Otherwise we'd try to scroll in such a way that the message
        // is at the very top of the messages list.
        // This would not be nice for the Ctrl + Down shortcut
        // (when quoting a message that a bit far up),
        // or when highlighting the reply that is already in view.
        block: 'nearest',
        inline: 'nearest',
        // behavior:
      })

      if (scrollTo.highlight === true) {
        // Trigger highlight animation

        // As was menitioned above, `domElement` could either be an
        // element inside of `<li>`, or the `<li>` itself.
        // The `<li>` is what implements the animation, so let's ensure that
        // we add the class to the `<li>` element.
        const highlightableElement =
          domElement.tagName === 'LI' ? domElement : domElement.parentElement
        if (highlightableElement !== null) {
          setTimeout(() => {
            // Stop the animation on the previously highlighted message.
            highlightableElement.parentElement
              ?.querySelectorAll(':scope > .highlight')
              .forEach(el => el.classList.remove('highlight'))

            // Retrigger animation
            highlightableElement.classList.add('highlight')
            highlightableElement.style.animation = 'none'
            highlightableElement.offsetHeight
            //@ts-ignore
            highlightableElement.style.animation = null
          }, 0)
        }
      }
    } else if (scrollTo.type === 'scrollToLastKnownPosition') {
      // "Why need scrollToLastKnownPosition if there is scroll anchoring
      // in browsers already?"
      // https://developer.mozilla.org/en-US/docs/Web/CSS/overflow-anchor/Guide_to_scroll_anchoring
      // Well, I am not sure why it is introduced back then,
      // but the reason we need it now is because scroll anchoring
      // isn't supported by Safari (WebKit) yet, and we are gonna run on WebKit
      // when we switch to Tauri, so let's not remove it yet.

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

        const shouldScrollToBottom =
          scrollBottom >=
          scrollHeight - maxScrollToBottomDistanceConsideredShort

        log.debug(
          'scrollToBottomIfClose',
          scrollBottom,
          scrollHeight,
          shouldScrollToBottom
        )

        if (shouldScrollToBottom) {
          const scrollTo = messageListRef.current.scrollHeight
          // Smooth scroll for newly arrived messages.
          // TODO also add this for self-sent messages.
          // In that case 'scrollToMessage' is used though...
          messageListRef.current.scrollTo({
            top: scrollTo,
            behavior: 'smooth',
          })
          pendingProgrammaticSmoothScrollTo.current = scrollTo

          // Smooth scroll duration is not defined by the spec:
          // https://drafts.csswg.org/cssom-view/#scrolling:
          // > in a user-agent-defined fashion
          // > over a user-agent-defined amount of time
          // As of 2024-09, on Firefox it appears to range from
          // 300 to 1000 ms, depending on scroll amount.
          // On Chromium: 50-700
          const smoothScrollMaxDuration = 1000

          // Why is 'scrollend' event not enough?
          // - Because the user might interrup such a scroll and start scrolling
          //   wherever they like, and 'scrollend' won't fire
          //   until they finish scrolling.
          // - Because 'scrollend' is not supported by WebKit yet
          //   https://webkit.org/b/201556
          //   and we'll be running on WebKit when we switch to Tauri.
          clearTimeout(pendingProgrammaticSmoothScrollTimeout.current)
          pendingProgrammaticSmoothScrollTimeout.current = window.setTimeout(
            () => {
              pendingProgrammaticSmoothScrollTo.current = null

              console.warn(
                'Smooth scroll: scrollend did not fire before timeout.\n' +
                  'Did the user scroll, or did the smooth scroll take so long?'
              )
            },
            smoothScrollMaxDuration
          )
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
      // We just scrolled where we needed to, now let's reset the value of
      // `viewState` so that we don't keep scrolling to the same place
      // again and again.
      unlockScroll()

      setTimeout(() => {
        // Since the scroll position might have changed,
        // let's invoke `onScroll`, e.g. to load more messages if we're close
        // to top / bottom
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

  // This is a fix for
  // https://github.com/deltachat/deltachat-desktop/issues/3763
  // That is, when the chat is scrolled to the bottom and you type
  // a multiline message, the composer would resize and the chat list would
  // get "scrolled up", i.e. the last message in the chat would get
  // partically covered. And so if someone sends a message while you're typing,
  // you'd have scroll down for it manually.
  //
  // This also handles other resizes, e.g. quoting a message, attaching a file,
  // or resizing the Delta Chat window itself.
  //
  // The behavior we're implementing here is similar to "scroll anchoring"
  // that browsers are supposed to perform, but unfortunately simply adding
  // one scroll anchor at the bottom of the message list doesn't save us
  // when the scrollable element itself resizes, and not just
  // the content inside of it.
  //
  // A probably better approach would be to use
  // `flex-direction: column-reverse;`, as in
  // https://github.com/deltachat/deltachat-desktop/pull/4116,
  // but it is buggy in Chromium and maybe WebKit (which we'll be using
  // when we switch to Tauri).
  //
  // `useEffect` instead of `useLayoutEffect` because we read `el.clientHeight`
  // on the first run and for that we want the contents to be painted already.
  // However, it appears to work either way.
  useEffect(() => {
    const el = messageListRef.current
    if (!el) {
      return
    }

    let prevHeight = el.clientHeight

    const observer = new ResizeObserver(entries => {
      const entry = entries[0]
      if (!entry) {
        return
      }
      const newHeight = el.clientHeight
      if (newHeight === prevHeight) {
        // In case only width changed or something.
        return
      }

      const scrollDistanceToBottomBeforeResize =
        el.scrollHeight - el.scrollTop - prevHeight
      if (
        scrollDistanceToBottomBeforeResize <=
        maxScrollToBottomDistanceConsideredShort
      ) {
        el.scrollTop = Number.MAX_SAFE_INTEGER
        // Sometimes this spews out negative numbers when we're scrolled
        // all the way to the bottom and then resize the window.
        // We'd expect this to be 0 in that case, but as long as
        // it works it's fine I guess.
        log.debug(
          `Message list resized, and distance to bottom was` +
            ` ${scrollDistanceToBottomBeforeResize} before the resize.` +
            ` Scrolling to bottom.`
        )
      }

      prevHeight = newHeight
    })

    observer.observe(el)
    return () => {
      observer.unobserve(el)
    }
  }, [])

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
        onScrollEnd={onScrollEnd}
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
    onScrollEnd: (event: Event) => void
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
      onScrollEnd,
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
    const scrolledRecently = useRef(false)
    const onScrolledRecentlyChange = useCallback(
      (newVal: boolean) => {
        if (scrolledRecently.current === newVal) {
          return
        }
        scrolledRecently.current = newVal

        if (messageListRef.current == undefined) {
          return
        }
        messageListRef.current.style.willChange = newVal
          ? 'scroll-position'
          : ''
      },
      [messageListRef]
    )
    const debouncedResetScrolledRecently = useMemo(
      () => debounce(() => onScrolledRecentlyChange(false), 3000),
      [onScrolledRecentlyChange]
    )
    const onScroll2 = (...args: Parameters<typeof onScroll>) => {
      const switchedChatRecently = Date.now() - switchedChatAt < 200
      // Ignore scrolls that are not caused by the user, because this
      // gives no indication as to whether they're gonna scroll soon.
      // Maybe they're just jumping between chats.
      const isScrollProgrammatic = switchedChatRecently
      if (!isScrollProgrammatic) {
        onScrolledRecentlyChange(true)
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

    // onScrollend is not defined in React, let's attach manually...
    useEffect(() => {
      const el = messageListRef.current
      if (!el) {
        return
      }

      el.addEventListener('scrollend', onScrollEnd)
      return () => el.removeEventListener('scrollend', onScrollEnd)

      // Yes, re-run on every re-render, because `messageListRef` might change
      // over the lifetime of this component.
    })

    if (!loaded) {
      return (
        <div id='message-list' ref={messageListRef} onScroll={onScroll2}>
          <ul></ul>
        </div>
      )
    }

    return (
      <div id='message-list' ref={messageListRef} onScroll={onScroll2}>
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
