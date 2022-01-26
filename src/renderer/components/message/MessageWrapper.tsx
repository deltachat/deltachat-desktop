import React from 'react'
import Message from './Message'
import { MessageType } from '../../../shared/shared-types'
import { ConversationType } from './MessageList'

type RenderMessageProps = {
  message: MessageType
  conversationType: ConversationType
  replies: (MessageType | null)[]
}

export const MessageWrapper = (props: RenderMessageProps) => {
  return (
    <li>
      <Message {...props} />
    </li>
  )
}
