import React, { useLayoutEffect } from 'react'
import Message from './Message'
import { ConversationType } from './MessageList'
import { Type } from '../../backend-com'
import { C } from '@deltachat/jsonrpc-client'
import { getLogger } from '../../../shared/logger'

const log = getLogger('renderer/message/MessageWrapper')

type RenderMessageProps = {
  key2: string
  message: Type.Message
  conversationType: ConversationType
  unreadMessageInViewIntersectionObserver: React.MutableRefObject<IntersectionObserver | null>
  isSelectMode: boolean
  isSelected: boolean
  selectMessage: () => void
  unselectMessage: () => void
}

export function MessageWrapper(props: RenderMessageProps) {
  const state = props.message.state
  const {
    isSelected,
    isSelectMode,
    key2,
    unreadMessageInViewIntersectionObserver,
    selectMessage,
    unselectMessage,
  } = props
  const shouldInViewObserve =
    state === C.DC_STATE_IN_FRESH || state === C.DC_STATE_IN_NOTICED

  // Add this message to unreadMessageInViewIntersectionObserver to mark this message
  // as read if it's displayed on the screen
  useLayoutEffect(() => {
    if (!shouldInViewObserve) return

    log.debug(
      `MessageWrapper: key: ${key2} We should observe this message if in view`
    )

    const messageBottomElement = document.querySelector('#bottom-' + key2)
    if (!messageBottomElement) {
      log.error(
        `MessageWrapper: key: ${key2} couldn't find dom element. Returning`
      )
      return
    }
    if (
      !unreadMessageInViewIntersectionObserver.current ||
      !unreadMessageInViewIntersectionObserver.current.observe
    ) {
      log.error(
        `MessageWrapper: key: ${key2} unreadMessageInViewIntersectionObserver is null. Returning`
      )
      return
    }

    unreadMessageInViewIntersectionObserver.current.observe(
      messageBottomElement
    )
    log.debug(`MessageWrapper: key: ${key2} Successfully observing ;)`)

    return () =>
      unreadMessageInViewIntersectionObserver.current?.unobserve(
        messageBottomElement
      )
  }, [key2, unreadMessageInViewIntersectionObserver, shouldInViewObserve])
  return (
    <li id={key2}>
      <Message {...props} />
      <div className='message-observer-bottom' id={'bottom-' + key2} />
    </li>
  )
}
