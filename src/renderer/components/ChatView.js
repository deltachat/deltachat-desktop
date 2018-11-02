const React = require('react')
const C = require('deltachat-node/constants')
const { ipcRenderer } = require('electron')

const SetupMessageDialog = require('./dialogs/SetupMessage')
const Composer = require('./Composer')
const { Overlay } = require('@blueprintjs/core')

const { TrackVisibility } = require('react-on-screen')

const MutationObserver = window.MutationObserver
const IntersectionObserver = window.IntersectionObserver

const { ConversationContext, Message } = require('./conversations')

const GROUP_TYPES = [
  C.DC_CHAT_TYPE_GROUP,
  C.DC_CHAT_TYPE_VERIFIED_GROUP
]

class ChatView extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      error: false,
      setupMessage: false,
      attachmentMessage: null
    }
    this.onSetupMessageClose = this.onSetupMessageClose.bind(this)
    this.focusInputMessage = this.focusInputMessage.bind(this)
    this.scrollToBottom = this.scrollToBottom.bind(this)
    this.renderMoreChats = this.renderMoreChats.bind(this)
    this.conversationDiv = React.createRef()
    this.topMessageDiv = React.createRef()
  }

  writeMessage (text) {
    const { chat } = this.props
    ipcRenderer.send('dispatch', 'sendMessage', chat.id, text)
  }

  componentWillUnmount () {
    if (this.scrollObserver) this.scrollObserver.disconnect()
    if (this.loadMoreObserver) this.loadMoreObserver.disconnect()
  }

  attachLoadMoreObserver () {
    if (!this.loadMoreObserver && this.topMessageDiv.current) {
      this.loadMoreObserver = new IntersectionObserver(this.renderMoreChats)
      this.loadMoreObserver.observe(this.topMessageDiv.current, {
        threshold: 0.2
      })
    }
  }

  attachScrollObserver () {
    if (!this.scrollObserver && this.conversationDiv.current) {
      this.scrollObserver = new MutationObserver(this.scrollToBottom)
      this.scrollObserver.observe(this.conversationDiv.current, { attributes: false, childList: true, subtree: true })
    }
  }

  componentDidUpdate () {
    this.attachLoadMoreObserver()
    this.attachScrollObserver()
    this.focusInputMessage()
  }

  componentDidMount () {
    this.scrollToBottom()
    this.focusInputMessage()
    this.attachLoadMoreObserver()
  }

  scrollToBottom (force) {
    var doc = document.querySelector('.ChatView #the-conversation')
    if (!doc) return console.log(`Didn't find .ChatView #the-conversation element`)

    doc.scrollTop = doc.scrollHeight
  }

  focusInputMessage () {
    let el = document.querySelector('.InputMessage input')
    if (!el) return console.log(`Didn't find .InputMessage input element`)

    el.focus()
  }

  onClickAttachment (attachmentMessage) {
    this.setState({ attachmentMessage })
  }

  onClickSetupMessage (setupMessage) {
    this.setState({ setupMessage })
  }

  onCloseAttachmentView () {
    this.setState({ attachmentMessage: null })
  }

  onSetupMessageClose () {
    // TODO: go back to main chat screen
    this.setState({ setupMessage: false })
  }

  render () {
    const { attachmentMessage, setupMessage } = this.state
    const { chat } = this.props
    const conversationType = convertChatType(chat.type)

    return (
      <div className='ChatView'>
        <SetupMessageDialog
          userFeedback={this.props.userFeedback}
          setupMessage={setupMessage}
          onClose={this.onSetupMessageClose}
        />
        <RenderMedia
          filemime={attachmentMessage && attachmentMessage.filemime}
          url={attachmentMessage && attachmentMessage.msg.file}
          close={this.onCloseAttachmentView.bind(this)}
        />

        <div id='the-conversation' ref={this.conversationDiv}>
          <ConversationContext>
            {chat.messageIds.map(messageId => {
              const msg = <TrackVisibility>
                <RenderMessage
                  messageId={messageId}
                  conversationType={conversationType}
                  onClickAttachment={this.onClickAttachment.bind(this, messageId)}
                />
              </TrackVisibility>
              return <li>{msg}</li>
            })}
          </ConversationContext>
        </div>
        <div className='InputMessage'>
          <Composer onSubmit={this.writeMessage.bind(this)} />
        </div>
      </div>
    )
  }
}

class RenderMedia extends React.Component {
  render () {
    const { url, filemime, close } = this.props
    let elm = <div />
    // TODO: there must be a stable external library for figuring out the right
    // html element to render
    if (filemime) {
      var contentType = convertContentType(filemime)
      switch (contentType.split('/')[0]) {
        case 'image':
          elm = <img src={url} />
          break
        case 'audio':
          elm = <audio src={url} controls='true' />
          break
        case 'video':
          elm = <video src={url} controls='true' />
          break
        default:
          elm = <iframe width='100%' height='100%' src={url} />
      }
    }
    return <Overlay isOpen={Boolean(url)}
      onClose={close}>
      {elm}
    </Overlay>
  }
}

class RenderMessage extends React.Component {
  render () {
    const { visible, onClickAttachment, messageId, conversationType } = this.props
    if (!visible) return <div>...</div>
    const message = ipcRenderer.sendSync('dispatchSync', 'getChatMessage', messageId)
    const { msg, fromId, id } = message
    const timestamp = msg.timestamp * 1000
    const direction = message.isMe ? 'outgoing' : 'incoming'
    const contact = {
      onSendMessage: () => console.log('send a message to', fromId),
      onClick: () => console.log('clicking contact', fromId)
    }

    function onReply () {
      console.log('reply to', message)
    }

    function onForward () {
      console.log('forwarding message', id)
    }

    function onDownload (el) {
      console.log('downloading', el)
    }

    function onDelete (el) {
      ipcRenderer.send('dispatch', 'deleteMessage', id)
    }

    function onShowDetail () {
      console.log('show detail', message)
    }

    function _onClickAttachment (event) {
      onClickAttachment(message)
    }

    const props = {
      padlock: msg.showPadlock,
      id,
      i18n: window.translate,
      conversationType,
      direction,
      onDownload,
      onReply,
      onForward,
      onDelete,
      onShowDetail,
      contact,
      onClickAttachment: _onClickAttachment,
      authorAvatarPath: message.contact.profileImage,
      authorName: message.contact.name,
      authorPhoneNumber: message.contact.address,
      status: convertMessageStatus(msg.state),
      timestamp
    }

    if (msg.file) {
      props.attachment = { url: msg.file, contentType: convertContentType(message.filemime), filename: msg.text }
    } else {
      props.text = msg.text
    }

    return (<Message {...props} />)
  }
}

function convertContentType (filemime) {
  if (filemime === 'application/octet-stream') return 'audio/ogg'
  return filemime
}

function convertChatType (type) {
  return GROUP_TYPES.includes(type) ? 'group' : 'direct'
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

module.exports = ChatView
