const React = require('react')
const C = require('deltachat-node/constants')
const { ipcRenderer } = require('electron')
const { Overlay } = require('@blueprintjs/core')

const SetupMessageDialog = require('./dialogs/SetupMessage')
const Composer = require('./Composer')
const RenderMedia = require('./RenderMedia')
const { ConversationContext, Message } = require('./conversations')

const MutationObserver = window.MutationObserver

const SCROLL_BUFFER = 70

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
      attachmentMessage: {}
    }
    this.onSetupMessageClose = this.onSetupMessageClose.bind(this)
    this.focusInputMessage = this.focusInputMessage.bind(this)
    this.scrollToBottom = this.scrollToBottom.bind(this)
    this.conversationDiv = React.createRef()
    this.lastId = this.props.chat.id
  }

  componentWillUnmount () {
    if (this.observer) this.observer.disconnect()
  }

  writeMessage (opts) {
    const { chat } = this.props
    ipcRenderer.send('dispatch', 'sendMessage', chat.id, opts.text, opts.filename)
  }

  fetchNextMessages () {
    this.scrollPrepare()
    ipcRenderer.send('dispatch', 'fetchMessages')
  }

  handleScroll () {
    if (!this.lastId || this.lastId === this.props.chat.id) this.restoreScroll()
    else this.scrollToBottom()
    this.lastId = this.props.chat && this.props.chat.id
  }

  restoreScroll () {
    this.doc.scrollTop = this.doc.scrollHeight - this.previousScrollHeightMinusTop
  }

  scrollPrepare () {
    this.previousScrollHeightMinusTop = this.doc.scrollHeight - this.doc.scrollTop
  }

  onScroll () {
    if (this.doc.scrollTop <= SCROLL_BUFFER) this.fetchNextMessages()
  }

  componentDidMount () {
    this.doc = document.querySelector('.ChatView #the-conversation')
    if (!this.doc) return console.log(`Didn't find .ChatView #the-conversation element`)
    if (!this.observer && this.conversationDiv.current) {
      this.observer = new MutationObserver(this.handleScroll.bind(this))
      this.observer.observe(this.conversationDiv.current, { attributes: false, childList: true, subtree: true })
    }
    this.doc.onscroll = this.onScroll.bind(this)
    this.scrollToBottom()
    this.focusInputMessage()
  }

  scrollToBottom (force) {
    this.doc.scrollTop = this.doc.scrollHeight
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
    this.setState({ attachmentMessage: {} })
  }

  onSetupMessageClose () {
    // TODO: go back to main chat screen
    this.setState({ setupMessage: false })
  }

  render () {
    const { attachmentMessage, setupMessage } = this.state
    const { chat } = this.props
    const conversationType = convertChatType(chat.type)
    const tx = window.translate
    const url = attachmentMessage.msg && attachmentMessage.msg.file

    return (
      <div className='ChatView'>
        <SetupMessageDialog
          userFeedback={this.props.userFeedback}
          setupMessage={setupMessage}
          onClose={this.onSetupMessageClose}
        />
        <Overlay
          className='attachment-overlay'
          isOpen={Boolean(url)}
          onClose={this.onCloseAttachmentView.bind(this)}>
          <div>
            <RenderMedia
              filemime={convertContentType(attachmentMessage.filemime)}
              url={url}
            />
          </div>
        </Overlay>

        <div id='the-conversation' ref={this.conversationDiv}>
          <ConversationContext>
            {chat.messages.map(message => {
              const msg = <RenderMessage
                message={message}
                conversationType={conversationType}
                onClickAttachment={this.onClickAttachment.bind(this, message)}
              />
              if (message.msg.isSetupmessage) {
                message.msg.text = tx('setupMessageInfo')
                return <li key={message.id} className='SetupMessage' onClick={this.onClickSetupMessage.bind(this, message)}>
                  {msg}
                </li>
              }
              return <li key={message.id}>{msg}</li>
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

class RenderMessage extends React.Component {
  render () {
    const { onClickAttachment, message, conversationType } = this.props
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
      onClickAttachment,
      authorAvatarPath: message.contact.profileImage,
      authorName: message.contact.name,
      authorPhoneNumber: message.contact.address,
      status: convertMessageStatus(msg.state),
      timestamp
    }

    if (msg.file && !msg.isSetupmessage) {
      props.attachment = {
        url: msg.file,
        contentType: convertContentType(message.filemime),
        filename: msg.text
      }
    } else {
      props.text = msg.text
    }

    return (<div className='MessageWrapper'><Message {...props} /></div>)
  }
}

function convertChatType (type) {
  return GROUP_TYPES.includes(type) ? 'group' : 'direct'
}

function convertContentType (filemime) {
  if (!filemime) return
  if (filemime === 'application/octet-stream') return 'audio/ogg'
  return filemime
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
