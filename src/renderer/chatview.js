const React = require('react')
const CONSTANTS = require('deltachat-node/constants')
const { ipcRenderer } = require('electron')

const WriteMessage = require('./write')
const { ConversationHeader, Message } = require('conversations').conversation
const { ConversationContext } = require('conversations').styleguide

var theme = 'light-theme' // user prefs?

class ChatView extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      error: false
    }
    this.shouldAutoScroll = true
    this.scrollTop = 0
  }

  writeMessage (message) {
    var chatId = this.props.screenProps.chatId
    ipcRenderer.send('dispatch', 'sendMessage', chatId, message)
  }

  componentDidUpdate (prevProps) {
    this.scrollToBottom()
  }

  componentWillUnmount () {
    var chatId = this.props.screenProps.chatId
    ipcRenderer.send('dispatch', 'clearChatPage', chatId)
  }

  componentDidMount () {
    var chatId = this.props.screenProps.chatId
    ipcRenderer.send('dispatch', 'loadMessages', chatId)
    const chat = this.getChat()
    this.setState({ value: chat.textDraft })

    var messagesDiv = document.querySelector('.message-list')
    if (messagesDiv) messagesDiv.scrollTop = this.scrollTop
  }

  getChat () {
    const { deltachat } = this.props
    var chatId = this.props.screenProps.chatId
    var index = deltachat.chats.findIndex((chat) => {
      return chat.id === chatId
    })
    return deltachat.chats[index]
  }

  scrollToBottom (force) {
    if (!force && !this.shouldAutoScroll) return
    var messagesDiv = document.querySelector('.window__main')
    if (messagesDiv) {
      messagesDiv.scrollTop = messagesDiv.scrollHeight
    }
  }

  render () {
    var self = this
    const chat = this.getChat()
    const showBackButton = true

    var onscroll = (event) => {
      var node = event.target
      if (node.scrollHeight <= node.clientHeight + node.scrollTop) {
        self.shouldAutoScroll = true
      } else {
        self.shouldAutoScroll = false
      }
    }

    return (<div className='window'>
      {this.state.error && this.state.error}
      <ConversationHeader
        i18n={window.translate}
        isMe={chat.isSelfTalk}
        showBackButton={showBackButton}
        onGoBack={this.props.changeScreen}
        name={chat.name}
        avatarPath={chat.profileImage}
        isVerified={chat.isVerified}
        id={chat.id}
      />
      <div className='window__main' onscroll={onscroll}>
        <ConversationContext theme={theme}>
          {chat.messages.map((message) =>
            <li>
              <RenderMessage message={message} />
            </li>
          )}
        </ConversationContext>
      </div>
      <WriteMessage onSubmit={this.writeMessage.bind(this)} />
    </div>)
  }
}

class RenderMessage extends React.Component {
  render () {
    const { message } = this.props
    const timestamp = message.msg.timestamp * 1000
    const direction = message.isMe ? 'outgoing' : 'incoming'
    const contact = {
      onSendMessage: () => console.log('send a message to', message.fromId),
      onClick: () => console.log('clicking contact', message.fromId)
    }

    var props = {
      id: message.id,
      i18n: window.translate,
      conversationType: 'direct', // or group
      direction,
      contact,
      authorName: message.contact.displayName,
      authorPhoneNumber: message.contact.address,
      status: convertMessageStatus(message.msg.state),
      timestamp,
      key: message.id
    }

    if (message.msg.file) {
      props.attachment = { url: message.msg.file, contentType: message.filemime }
    } else {
      props.text = message.msg.text
    }

    return (<Message {...props} />)
  }
}

function convertMessageStatus (s) {
  switch (s) {
    case CONSTANTS.DC_STATE_IN_FRESH:
      return 'sent'
    case CONSTANTS.DC_STATE_OUT_FAILED:
      return 'error'
    case CONSTANTS.DC_STATE_IN_SEEN:
      return 'read'
    case CONSTANTS.DC_STATE_IN_NOTICED:
      return 'read'
    case CONSTANTS.DC_STATE_OUT_DELIVERED:
      return 'delivered'
    case CONSTANTS.DC_STATE_OUT_MDN_RCVD:
      return 'read'
    case CONSTANTS.DC_STATE_OUT_PENDING:
      return 'sending'
    case CONSTANTS.DC_STATE_UNDEFINED:
      return 'error'
  }
}

module.exports = ChatView
