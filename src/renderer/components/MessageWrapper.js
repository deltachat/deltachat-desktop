const React = require('react')
const path = require('path')
const C = require('deltachat-node/constants')
const styled = require('styled-components').default
const Message = require('./conversations/Message')
const { remote, ipcRenderer } = require('electron')
const moment = require('moment')
const mime = require('mime-types')
const filesizeConverter = require('filesize')
const log = require('../../logger').getLogger('renderer/messageWrapper')
const chatStore = require('../stores/chat')

const GROUP_TYPES = [
  C.DC_CHAT_TYPE_GROUP,
  C.DC_CHAT_TYPE_VERIFIED_GROUP
]

const SetupMessage = styled.div`
  .module-message__text {
    color: #ed824e;
  }
`

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
    background-color: ${props => props.theme.deltaInfoMessageBubbleBg};
    border-radius: 10px;
    opacity: 0.44;
    color: ${props => props.theme.deltaInfoMessageBubbleColor};
  }
`

const MessageWrapper = styled.div`
  .module-message__metadata {
    margin-top: 10px;
    margin-bottom: -7px;
    float: right;
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

  .module-message__img-attachment {
    object-fit: unset;
    width: auto;
    max-width: 100%;
    height: auto;
    min-height: unset;
  }

  .module-message__img-border-overlay {
    box-shadow: unset;
  }

  .module-message__metadata__date {
    color: ${props => props.theme.deltaChatMessageBubbleSelfStatusColor};
  }

  .module-message__metadata__status-icon--read, .module-message__metadata__status-icon--delivered {
    background-color: ${props => props.theme.deltaChatMessageBubbleSelfStatusColor};
  }

  .module-message__buttons__reply {
    display: none;
  }

  .module-message__text--incoming a {
    color: #070c14;
  }

  .module-message__generic-attachment__file-size--incoming,
  .module-message__generic-attachment__file-name--incoming {
    color: black;
  }

  .module-message__generic-attachment__icon__extension{
    font-family: monospace;
  }
`

function render (props) {
  const { message, onClickSetupMessage, onClickContactRequest } = props

  let key = message.id
  let body

  if (message.id === C.DC_MSG_ID_DAYMARKER) {
    key = message.daymarker.id + message.daymarker.timestamp
    body = (
      <InfoMessage>
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
      <SetupMessage key={message.id}
        onClick={onClickSetupMessage}>
        <RenderMessage {...props} />
      </SetupMessage>
    )
  } else if (message.msg.chatId === C.DC_CHAT_ID_DEADDROP) {
    body = (
      <div key={message.id}
        onClick={onClickContactRequest}>
        <RenderMessage {...props} />
      </div>
    )
  } else {
    body = <RenderMessage {...props} />
  }

  return <li key={key}>{body}</li>
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
      onSendMessage: () => log.debug(`send a message to ${fromId}`),
      onClick: () => { log.debug('click contact') }
    }

    const props = {
      padlock: msg.showPadlock,
      id,
      conversationType,
      onDownload: message.onDownload,
      onReply: message.onReply,
      onForward: message.onForward,
      onDelete: message.onDelete,
      onShowDetail,
      contact,
      onClickAttachment,
      authorAvatarPath: message.contact.profileImage,
      authorColor: message.contact.color,
      authorName: message.contact.name,
      authorAddress: message.contact.address,
      status: msg.status,
      text: msg.text,
      direction: msg.direction,
      timestamp: msg.sentAt
    }

    if (msg.attachment && !msg.isSetupmessage) props.attachment = msg.attachment
    if (message.isInfo) return <InfoMessage><p>{msg.text}</p></InfoMessage>

    return (<MessageWrapper ref={this.el}><Message {...props} /></MessageWrapper>)
  }
}

function convert (message) {
  message.onDownload = () => {
    const defaultPath = path.join(remote.app.getPath('downloads'), path.basename(message.msg.file))
    remote.dialog.showSaveDialog({
      defaultPath
    }, (filename) => {
      if (filename) ipcRenderer.send('saveFile', message.msg.file, filename)
    })
  }

  message.onDelete = () => chatStore.dispatch({ type: 'UI_DELETE_MESSAGE', payload: { msgId: message.id } })

  const msg = message.msg

  if (msg.isSetupmessage) {
    msg.text = window.translate('autocrypt_asm_click_body')
  }

  Object.assign(msg, {
    sentAt: msg.timestamp * 1000,
    receivedAt: msg.receivedTimestamp * 1000,
    direction: message.isMe ? 'outgoing' : 'incoming',
    status: convertMessageStatus(msg.state)
  })

  if (msg.file) {
    msg.attachment = {
      url: msg.file,
      contentType: convertContentType(message),
      fileName: message.filename || msg.text,
      fileSize: filesizeConverter(message.filesize)
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

function convertContentType (message) {
  const filemime = message.filemime

  if (!filemime) return 'application/octet-stream'
  if (filemime !== 'application/octet-stream') return filemime

  switch (message.msg.viewType) {
    case C.DC_MSG_IMAGE:
      return 'image/jpg'
    case C.DC_MSG_VOICE:
      return 'audio/ogg'
    case C.DC_MSG_FILE:
      const type = mime.lookup(message.msg.file)
      if (type) return type
      else return 'application/octet-stream'
    default:
      return 'application/octet-stream'
  }
}

function convertChatType (type) {
  return GROUP_TYPES.includes(type) ? 'group' : 'direct'
}

module.exports = {
  convert,
  render
}
