const React = require('react')
const C = require('deltachat-node/constants')
const { Message } = require('./conversations')
const { ipcRenderer } = require('electron')

const tx = window.translate

const GROUP_TYPES = [
  C.DC_CHAT_TYPE_GROUP,
  C.DC_CHAT_TYPE_VERIFIED_GROUP
]

function render (props) {
  const { message, onClickSetupMessage } = props
  let body = <RenderMessage {...props} />

  if (message.msg.isSetupmessage) {
    return <li key={message.id}
      className='SetupMessage'
      onClick={onClickSetupMessage}>
      {body}
    </li>
  }

  return <li key={message.id}>{body}</li>
}

/**
 * RenderMessage takes a message already created with Message.convert
 * and returns a React component of that message from the Conversations
 * library. This class mostly just converts the necessary properties to what
 * is expected by Conversations.Message
 */
class RenderMessage extends React.Component {
  render () {
    const { onShowDetail, onClickAttachment, chat } = this.props
    const message = this.props.message
    const { fromId, id } = message
    const msg = message.msg
    const conversationType = convertChatType(chat.type)

    const contact = {
      onSendMessage: () => console.log('send a message to', fromId),
      onClick: () => console.log('clicking contact', fromId)
    }

    const props = {
      padlock: msg.showPadlock,
      id,
      i18n: window.translate,
      conversationType,
      onDownload: message.onDownload,
      onReply: message.onReply,
      onForward: message.onForward,
      onDelete: message.onDelete,
      onShowDetail,
      contact,
      onClickAttachment,
      authorAvatarPath: message.contact.profileImage,
      authorName: message.contact.name,
      authorPhoneNumber: message.contact.address,
      status: msg.status,
      text: msg.text,
      direction: msg.direction,
      timestamp: msg.sentAt
    }

    if (msg.attachment.url && !msg.isSetupmessage) props.attachment = msg.attachment

    return (<div className='MessageWrapper'><Message {...props} /></div>)
  }
}

function convert (message) {
  message.onReply = () => {
    console.log('reply to', message)
  }

  message.onForward = () => {
    console.log('forward to')
  }

  message.onDownload = () => {
    console.log('downloading')
  }

  message.onDelete = (el) => {
    ipcRenderer.send('dispatch', 'deleteMessage', message.id)
  }

  if (message.msg.isSetupmessage) message.msg.text = tx('setupMessageInfo')
  message.msg = Object.assign(message.msg, {
    sentAt: message.msg.timestamp * 1000,
    receivedAt: message.msg.receivedTimestamp * 1000,
    attachment: {
      url: message.msg.file,
      contentType: convertContentType(message.filemime),
      filename: message.msg.text
    },
    direction: message.isMe ? 'outgoing' : 'incoming',
    status: convertMessageStatus(message.msg.state)
  })
  return message
}

function convertMessageStatus (s) {
  switch (s) {
    case C.DC_STATE_IN_FRESH:
      return 'sent'
    case C.DC_STATE_OUT_FAILED:
      return 'error'
    case C.DC_STATE_IN_SEEN:
      return 'read'
    case C.DC_STATE_IN_NOTICED:
      return 'read'
    case C.DC_STATE_OUT_DELIVERED:
      return 'delivered'
    case C.DC_STATE_OUT_MDN_RCVD:
      return 'read'
    case C.DC_STATE_OUT_PENDING:
      return 'sending'
    case C.DC_STATE_UNDEFINED:
      return 'error'
  }
}

function convertContentType (filemime) {
  if (!filemime) return 'image/jpg'
  if (filemime === 'application/octet-stream') return 'audio/ogg'
  return filemime
}

function convertChatType (type) {
  return GROUP_TYPES.includes(type) ? 'group' : 'direct'
}

module.exports = {
  convert,
  render
}
