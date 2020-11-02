import React from 'react'
import Message from './Message'
import { getLogger } from '../../../shared/logger'
import { MessageType } from '../../../shared/shared-types'

const log = getLogger('renderer/messageWrapper')

type RenderMessageProps = {
  message: MessageType
  conversationType: 'group' | 'direct'
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
