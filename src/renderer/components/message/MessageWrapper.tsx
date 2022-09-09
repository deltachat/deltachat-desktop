import React from 'react'
import Message from './Message'
import { ConversationType } from './MessageList'
import { Type } from '../../backend-com'

type RenderMessageProps = {
  message: Type.Message
  conversationType: ConversationType
}

export const MessageWrapper = (props: RenderMessageProps) => {
  return (
    <li>
      <Message {...props} />
    </li>
  )
}
