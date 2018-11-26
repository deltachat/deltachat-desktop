const React = require('react')
const path = require('path')
const C = require('deltachat-node/constants')
const styled = require('styled-components').default
const { Message } = require('./conversations')
const { remote, ipcRenderer } = require('electron')

const GROUP_TYPES = [
  C.DC_CHAT_TYPE_GROUP,
  C.DC_CHAT_TYPE_VERIFIED_GROUP
]

const SetupMessage = styled.li`
  .module-message__text {
    color: #ed824e;
  }
`

const InfoMessage = styled.div`
  text-align: center;
  font-style: italic;
  color: #757575;
`

const MessageWrapper = styled.div`
  .module-message__metadata {
    margin-top: 10px;
    margin-bottom: -7px;
  }

  .module-message__author-default-avatar__label {
    background-color: black;
    top: -121px;
    left: -10px;
    border-radius: 50%;
    width: 36px;
    height: 36px;
    background-color: #757575;
    color: #ffffff;
    font-size: 25px;
    line-height: 36px;
  }

  .module-message__author-default-avatar {
    position: static;
    margin-right: 8px;
  }

`

function render (props) {
  const { message, onClickSetupMessage } = props
  let body = <RenderMessage {...props} />

  if (message.msg.isSetupmessage) {
    return <SetupMessage key={message.id}
      onClick={onClickSetupMessage}>
      {body}
    </SetupMessage>
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
  constructor (props) {
    super(props)
    this.el = React.createRef()
  }

  componentDidMount () {
    if (!this.el.current) return
    var as = this.el.current.querySelectorAll('a')
    as.forEach((a) => {
      a.onclick = (event) => {
        event.preventDefault()
        remote.shell.openExternal(a.href)
      }
    })
  }

  render () {
    const { onShowDetail, onClickAttachment, chat, message } = this.props
    const { fromId, id } = message
    const msg = message.msg
    const conversationType = convertChatType(chat.type)

    const contact = {
      onSendMessage: () => console.log('send a message to', fromId),
      onClick: () => { console.log('click contact') }
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

    if (msg.attachment && !msg.isSetupmessage) props.attachment = msg.attachment
    if (message.isInfo) return <InfoMessage>{msg.text}</InfoMessage>

    return (<MessageWrapper ref={this.el}><Message {...props} /></MessageWrapper>)
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
    var defaultPath = path.join(remote.app.getPath('downloads'), path.basename(message.msg.file))
    remote.dialog.showSaveDialog({
      defaultPath
    }, (filename) => {
      if (filename) ipcRenderer.send('saveFile', message.msg.file, filename)
    })
  }

  message.onDelete = (el) => {
    ipcRenderer.send('dispatch', 'deleteMessage', message.id)
  }

  var msg = message.msg

  if (msg.isSetupmessage) msg.text = window.translate('setupMessageInfo')
  msg = Object.assign(msg, {
    sentAt: msg.timestamp * 1000,
    receivedAt: msg.receivedTimestamp * 1000,
    direction: message.isMe ? 'outgoing' : 'incoming',
    status: convertMessageStatus(msg.state)
  })

  if (msg.file) {
    msg.attachment = {
      url: msg.file,
      contentType: convertContentType(message.filemime),
      filename: msg.text
    }
  }
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
