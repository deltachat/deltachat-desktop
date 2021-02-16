import React from 'react'
import Message from './Message'
import { MessageType } from '../../../shared/shared-types'
import { ConversationType } from './MessageList'

type RenderMessageProps = {
  message: MessageType
  conversationType: ConversationType
}

export const MessageWrapper = (props: RenderMessageProps) => {
  return (
    <li>
      <RenderMessage {...props} />
    </li>
  )
}

export const RenderMessage = React.memo(Message, (prevProps, nextProps) => {
  const areEqual = prevProps.message === nextProps.message
  return areEqual
})
