import React, { useContext } from 'react'
import { C } from 'deltachat-node/dist/constants'
import Message from './Message'
import { ScreenContext } from '../../contexts'
import logger from '../../../shared/logger'
import { openViewProfileDialog } from '../helpers/ChatMethods'

const log = logger.getLogger('renderer/messageWrapper')

const GROUP_TYPES = [C.DC_CHAT_TYPE_GROUP, C.DC_CHAT_TYPE_VERIFIED_GROUP]

export const render = props => {
  return (
    <li>
      <RenderMessage {...props} />
    </li>
  )
}

export const RenderMessage = React.memo(
  props => {
    const { message, locationStreamingEnabled, chat, chatStoreDispatch } = props
    const { fromId, id } = message.msg
    const msg = message.msg
    const tx = window.translate
    const screenContext = useContext(ScreenContext)
    const { openDialog } = screenContext

    message.onForward = () => openDialog('ForwardMessage', { message })

    const conversationType = GROUP_TYPES.includes(chat.type)
      ? 'group'
      : 'direct'
    const onShowDetail = () => openDialog('MessageDetail', { message, chat })
    const onDelete = () =>
      openDialog('ConfirmationDialog', {
        message: tx('ask_delete_message_desktop'),
        confirmLabel: tx('delete'),
        cb: yes =>
          yes &&
          chatStoreDispatch({ type: 'UI_DELETE_MESSAGE', payload: msg.id }),
      })
    const onContactClick = async contact => {
      openViewProfileDialog(screenContext, contact)
    }

    const contact = {
      onSendMessage: () => log.debug(`send a message to ${fromId}`),
      onClick: () => {
        log.debug('click contact')
      },
    }

    if (
      msg.text ===
      '[The message was sent with non-verified encryption.. See "Info" for details.]'
    ) {
      msg.text = window.translate('message_not_verified')
    }

    props = {
      padlock: msg.showPadlock,
      id,
      conversationType,
      onReply: message.onReply,
      onForward: message.onForward,
      onDelete,
      onShowDetail,
      onContactClick,
      contact,
      status: msg.status,
      text: msg.text,
      direction: msg.direction,
      timestamp: msg.sentAt,
      viewType: msg.viewType,
      message,
      hasLocation: msg.hasLocation && locationStreamingEnabled,
    }

    const isSetupmessage = message.msg.isSetupmessage
    const isDeadDrop = message.msg.chatId === C.DC_CHAT_ID_DEADDROP
    if (isSetupmessage) {
      props.onClickMessageBody = () =>
        openDialog('EnterAutocryptSetupMessage', { message })
    } else if (isDeadDrop) {
      props.onClickMessageBody = () => {
        openDialog('DeadDrop', message)
      }
    }

    if (msg.attachment && !msg.isSetupmessage) props.attachment = msg.attachment
    if (message.isInfo)
      return (
        <div
          className='info-message'
          onContextMenu={onShowDetail}
          custom-selectable
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
const MessageWrapper = { render }
export default MessageWrapper
