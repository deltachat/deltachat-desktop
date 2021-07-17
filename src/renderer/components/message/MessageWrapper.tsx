import React, { useLayoutEffect } from 'react'
import MessageComponent from './Message'
import { Message, MessageState } from '../../../shared/shared-types'
import { getLogger } from '../../../shared/logger'
import { ConversationType } from './MessageList'

const log = getLogger('renderer/message/MessageWrapper')

type RenderMessageProps = {
  key2: string
  message: Message
  conversationType: ConversationType
  isDeviceChat: boolean
  unreadMessageInViewIntersectionObserver: React.MutableRefObject<any>
}

export const MessageWrapper = (props: RenderMessageProps) => {
  const state = props.message.state
  const shouldInViewObserve =
    state === MessageState.IN_FRESH || state === MessageState.IN_NOTICED

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
      props.unreadMessageInViewIntersectionObserver.current.unobserve(
        messageBottomElement
      )
  }, [])

  return (
    <li id={props.key2}>
      <RenderMessage {...props} />
      <div id={'bottom-' + props.key2} />
    </li>
  )
}

export const RenderMessage = React.memo(
  MessageComponent,
  (prevProps, nextProps) => {
    const areEqual = prevProps.message === nextProps.message
    return areEqual
  }
)
