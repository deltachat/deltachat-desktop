import React, { useLayoutEffect } from 'react'
import { C } from '@deltachat/jsonrpc-client'

import Message from './Message'
import { ConversationType } from './MessageList'
import { Type } from '../../backend-com'
import { getLogger } from '../../../shared/logger'

const log = getLogger('renderer/message/MessageWrapper')

type RenderMessageProps = {
  key2: string
  message: Type.Message
  isHover: boolean
  conversationType: ConversationType
  unreadMessageInViewIntersectionObserver: React.MutableRefObject<IntersectionObserver | null>
}

export function MessageWrapper(props: RenderMessageProps) {
  const state = props.message.state
  const shouldInViewObserve =
    state === C.DC_STATE_IN_FRESH || state === C.DC_STATE_IN_NOTICED

  // Add this message to unreadMessageInViewIntersectionObserver to mark this message
  // as read if it's displayed on the screen
  useLayoutEffect(() => {
    if (!shouldInViewObserve) return

    log.debug(
      `MessageWrapper: key: ${props.key2} We should observe this message if in view`
    )

    const messageBottomElement = document.querySelector('#bottom-' + props.key2)
    if (!messageBottomElement) {
      log.error(
        `MessageWrapper: key: ${props.key2} couldn't find dom element. Returning`
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
    <li id={props.key2}>
      <Message {...props} />
      <div className='message-observer-bottom' id={'bottom-' + props.key2} />
    </li>
  )
}
