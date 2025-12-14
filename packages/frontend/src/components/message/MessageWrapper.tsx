import React, { useLayoutEffect, useRef } from 'react'
import { C } from '@deltachat/jsonrpc-client'

import Message from './Message'
import { ConversationType } from './MessageList'
import { getLogger } from '../../../../shared/logger'

import type { T } from '@deltachat/jsonrpc-client'

type RenderMessageProps = {
  key2: string
  chat: T.FullChat
  message: T.Message
  conversationType: ConversationType
  unreadMessageInViewIntersectionObserver: React.RefObject<IntersectionObserver | null>
}

const log = getLogger('renderer/message/MessageWrapper')

export function MessageWrapper(props: RenderMessageProps) {
  const observerRef = useRef<HTMLDivElement>(null)
  const state = props.message.state
  const shouldInViewObserve =
    state === C.DC_STATE_IN_FRESH || state === C.DC_STATE_IN_NOTICED

  // Add this message to unreadMessageInViewIntersectionObserver to mark this message
  // as read if it's displayed on the screen
  useLayoutEffect(() => {
    if (!shouldInViewObserve) return

    const messageBottomElement = observerRef.current
    if (!messageBottomElement) {
      log.error(
        `MessageWrapper: expected messageBottomElement for message ${props.key2} to be present, but it's not?`
      )
      return
    }
    if (
      !props.unreadMessageInViewIntersectionObserver.current ||
      !props.unreadMessageInViewIntersectionObserver.current.observe
    ) {
      log.error(
        `MessageWrapper: key: ${props.key2} unreadMessageInViewIntersectionObserver is null. Returning`
      )
      return
    }

    props.unreadMessageInViewIntersectionObserver.current.observe(
      messageBottomElement
    )
    log.debug(`MessageWrapper: key: ${props.key2} Successfully observing ;)`)

    return () =>
      props.unreadMessageInViewIntersectionObserver.current?.unobserve(
        messageBottomElement
      )
  }, [
    props.key2,
    props.unreadMessageInViewIntersectionObserver,
    shouldInViewObserve,
  ])

  return (
    <li id={props.key2} className='message-wrapper'>
      <Message {...props} />
      {/* TODO perf: `shouldInViewObserve` does not become `false`
      when we do mark a message as read, because the messagelist.ts
      does not update its state on such events.
      Maybe we could listen for such events in this component,
      or somehow manually remove the observer when we do perform the
      `rpc.markseenMsgs` request. */}
      {shouldInViewObserve && (
        <div
          ref={observerRef}
          className='message-observer-bottom'
          data-messageid={props.key2}
        />
      )}
    </li>
  )
}
