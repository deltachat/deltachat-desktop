import React, { useContext } from 'react'
import C from 'deltachat-node/constants'
import styled from 'styled-components'
import Message from './Message'
import moment from 'moment'
import mime from 'mime-types'
import ScreenContext from '../../contexts/ScreenContext'
import filesizeConverter from 'filesize'
import logger from '../../../logger'
import { useMessageListStore } from '../../stores/MessageList'


const log = logger.getLogger('renderer/messageWrapper')

const GROUP_TYPES = [
  C.DC_CHAT_TYPE_GROUP,
  C.DC_CHAT_TYPE_VERIFIED_GROUP
]

const InfoMessage = styled.div`
  width: 100%;
  text-align: center;
  margin: 26px 0px;

  p {
    display: inline-block;
    text-align: center;
    font-style: italic;
    font-weight: bold;
    padding: 7px 14px;
    background-color: ${props => props.theme.infoMessageBubbleBg};
    border-radius: 10px;
    opacity: 0.44;
    color: ${props => props.theme.infoMessageBubbleText};
  }
`

export const render = React.memo((props) => {
  const { message, messageId, chat, locationStreamingEnabled } = props
  const { openDialog } = useContext(ScreenContext)
  const tx = window.translate

  const onClickContactRequest = () => openDialog('DeadDrop', { deaddrop: message })
  const onClickSetupMessage = setupMessage => openDialog('EnterAutocryptSetupMessage', { setupMessage })

  props = { ...props, onClickSetupMessage, onClickContactRequest }
  message.onReply = () => log.debug('reply to', message)
  message.onForward = forwardMessage => openDialog('ForwardMessage', { forwardMessage })

  let body

  if (message.id === C.DC_MSG_ID_DAYMARKER) {
    const key = message.daymarker.id + message.daymarker.timestamp
    body = (
      <InfoMessage key={key}>
        <p>
          {moment.unix(message.daymarker.timestamp).calendar(null, {
            lastDay: '',
            lastWeek: 'LL',
            sameElse: 'LL'
          })}
        </p>
      </InfoMessage>
    )
  } else if (message.msg.isSetupmessage) {
    body = (
      <div className='setupMessage pointer' key={message.id}
        onClick={onClickSetupMessage}>
        <RenderMessage {...props} />
      </div>
    )
  } else if (message.msg.chatId === C.DC_CHAT_ID_DEADDROP) {
    body = (
      <div key={message.id}
        onClick={onClickContactRequest} className={'pointer'}>
        <RenderMessage {...props} />
      </div>
    )
  } else {
    body = <RenderMessage {...props} />
  }

  return <li>{body}</li>
})

/**
 * RenderMessage takes a message already created with Message.convert
 * and returns a React component of that message from the Conversations
 * library. This class mostly just converts the necessary properties to what
 * is expected by Conversations.Message
 */
export function RenderMessage (props) {
  const [messageListStore, messageListDispatch] = useMessageListStore()
  const { chat, message, locationStreamingEnabled } = props
  const { fromId, id } = message
  const msg = message.msg
  const tx = window.translate
  const { openDialog } = useContext(ScreenContext)

  const conversationType = GROUP_TYPES.includes(chat.type) ? 'group' : 'direct'
  const onShowDetail = message => openDialog('MessageDetail', { message, chat })
  const onDelete = message => openDialog('ConfirmationDialog', {
    message: tx('ask_delete_message_desktop'),
    cb: yes => yes && messageListDispatch({ type: 'UI_DELETE_MESSAGE', payload: id })
  })

  const contact = {
    onSendMessage: () => log.debug(`send a message to ${fromId}`),
    onClick: () => { log.debug('click contact') }
  }

  if (msg.text === '[The message was sent with non-verified encryption.. See "Info" for details.]') {
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
    contact,
    status: msg.status,
    text: msg.text,
    direction: msg.direction,
    timestamp: msg.sentAt,
    viewType: msg.viewType,
    message,
    hasLocation: (msg.hasLocation && locationStreamingEnabled)
  }

  if (msg.attachment && !msg.isSetupmessage) props.attachment = msg.attachment
  if (message.isInfo) return <InfoMessage><p>{msg.text}</p></InfoMessage>

  return <Message {...props} />
}
const MessageWrapper = { render }
export default MessageWrapper
