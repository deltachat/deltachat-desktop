import React, { useContext } from 'react'
import { C } from 'deltachat-node/dist/constants'
import Message from './Message'
import { ScreenContext } from '../../contexts'
import { getLogger } from '../../../shared/logger'
import { openViewProfileDialog } from '../helpers/ChatMethods'
import { ChatStoreState, ChatStoreDispatch } from '../../stores/chat'
import { MessageType, DCContact } from '../../../shared/shared-types'

const log = getLogger('renderer/messageWrapper')

const GROUP_TYPES = [C.DC_CHAT_TYPE_GROUP, C.DC_CHAT_TYPE_VERIFIED_GROUP]

type RenderMessageProps = {
  message: MessageType
  locationStreamingEnabled: boolean
  chat: ChatStoreState
  chatStoreDispatch: ChatStoreDispatch
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
    const { message, locationStreamingEnabled, chat, chatStoreDispatch } = props
    const { fromId, id } = message.msg
    const msg = message.msg
    const tx = window.translate
    const screenContext = useContext(ScreenContext)
    const { openDialog } = screenContext

    const conversationType: 'group' | 'direct' = GROUP_TYPES.includes(chat.type)
      ? 'group'
      : 'direct'
    const onShowDetail = () => openDialog('MessageDetail', { message, chat })
    const onDelete = () =>
      openDialog('ConfirmationDialog', {
        message: tx('ask_delete_message_desktop'),
        confirmLabel: tx('delete'),
        cb: (yes: boolean) =>
          yes &&
          chatStoreDispatch({ type: 'UI_DELETE_MESSAGE', payload: msg.id }),
      })
    const onContactClick = async (contact: DCContact) => {
      openViewProfileDialog(screenContext, contact.id)
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

    let new_props = {
      padlock: msg.showPadlock,
      id,
      conversationType,
      // onReply: message.onReply,
      onForward: () => openDialog('ForwardMessage', { message }),
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
          onContextMenu={onShowDetail}
          custom-selectable='true'
        >
          <p>{msg.text}</p>
        </div>
      )

    return <Message {...props} {...new_props} />
  },
  (prevProps, nextProps) => {
    const areEqual = prevProps.message === nextProps.message
    return areEqual
  }
)
