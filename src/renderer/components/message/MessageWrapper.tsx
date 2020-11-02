import React from 'react'
import Message from './Message'
import { getLogger } from '../../../shared/logger'
import { MessageType } from '../../../shared/shared-types'
import { openMessageInfo } from './messageFunctions'

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

export const RenderMessage = React.memo(
  (props: RenderMessageProps) => {
    const { message } = props
    const msg = message.msg

    if (message.isInfo)
      return (
        <div
          className='info-message'
          onContextMenu={openMessageInfo.bind(null, message)}
          custom-selectable='true'
        >
          <p>{msg.text}</p>
        </div>
      )

    return <Message {...props} />
  },
  (prevProps, nextProps) => {
    const areEqual = prevProps.message === nextProps.message
    return areEqual
  }
)
