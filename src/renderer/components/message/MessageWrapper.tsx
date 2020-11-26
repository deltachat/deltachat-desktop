import React from 'react'
import Message from './Message'
import { MessageType } from '../../../shared/shared-types'

type RenderMessageProps = {
  message: MessageType
  conversationType: 'group' | 'direct'
  isDeviceChat: boolean
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
