import React, { useContext } from 'react'
import { C } from 'deltachat-node/dist/constants'
import Message, { CallMessage } from './Message'
import { ScreenContext, useTranslationFunction } from '../../contexts'
import { getLogger } from '../../../shared/logger'
import { openViewProfileDialog } from '../helpers/ChatMethods'
import { ChatStoreState } from '../../stores/chat'
import { MessageType, DCContact } from '../../../shared/shared-types'
import { openMessageInfo } from './messageFunctions'

const log = getLogger('renderer/messageWrapper')

type RenderMessageProps = {
  message: MessageType
  locationStreamingEnabled: boolean
  chat: ChatStoreState
  disableMenu?: boolean
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
    const { message, locationStreamingEnabled, chat } = props
    const { fromId, id } = message.msg
    const msg = message.msg
    const screenContext = useContext(ScreenContext)
    const { openDialog } = screenContext

    const conversationType: 'group' | 'direct' =
      chat.type === C.DC_CHAT_TYPE_GROUP ? 'group' : 'direct'
    const onContactClick = async (contact: DCContact) => {
      openViewProfileDialog(screenContext, contact.id)
    }

    const contact = {
      onSendMessage: () => log.debug(`send a message to ${fromId}`),
      onClick: () => {
        log.debug('click contact')
      },
    }

    let new_props = {
      padlock: msg.showPadlock,
      id,
      conversationType,
      // onReply: message.onReply,
      onContactClick,
      contact,
      status: msg.status,
      text: msg.text,
      direction: msg.direction,
      timestamp: msg.sentAt,
      viewType: msg.viewType,
      message,
      hasLocation: msg.hasLocation && locationStreamingEnabled,
      attachment: msg.attachment && !msg.isSetupmessage && msg.attachment,
      onClickMessageBody: null as () => void,
    }

    const isSetupmessage = message.msg.isSetupmessage
    const isDeadDrop = message.msg.chatId === C.DC_CHAT_ID_DEADDROP
    if (isSetupmessage) {
      new_props.onClickMessageBody = () =>
        openDialog('EnterAutocryptSetupMessage', { message })
    } else if (isDeadDrop) {
      new_props.onClickMessageBody = () => {
        openDialog('DeadDrop', message)
      }
    }

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
    if (message.msg.viewType === C.DC_MSG_VIDEOCHAT_INVITATION)
      return <CallMessage {...props} {...new_props} />

    return <Message {...props} {...new_props} />
  },
  (prevProps, nextProps) => {
    const areEqual = prevProps.message === nextProps.message
    return areEqual
  }
)
