const React = require('react')
const CONSTANTS = require('deltachat-node/constants')
const {ipcRenderer} = require('electron')

const { Message } = require('conversations').conversation
const { ConversationContext } = require('conversations').styleguide

const Back = require('./back')

var theme = 'light-theme' // user prefs?

class ChatView extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      value: undefined
    }
    this.handleChange = this.handleChange.bind(this)
  }

  handleChange (e) {
    var value = e.target.value
    this.setState({value})
  }

  writeMessage () {
    var chatId = this.props.screenProps.chatId
    ipcRenderer.send('dispatch', 'sendMessage', chatId, this.state.value)
    this.setState({value: ''})
  }

  componentWillUnmount () {
    var chatId = this.props.screenProps.chatId
    ipcRenderer.send('dispatch', 'clearChatPage', chatId)
  }

  componentDidMount () {
    var chatId = this.props.screenProps.chatId
    ipcRenderer.send('dispatch', 'loadMessages', chatId)
    const chat = this.getChat()
    this.setState({value: chat.textDraft})
  }

  getChat () {
    const {deltachat} = this.props
    var chatId = this.props.screenProps.chatId
    var index = deltachat.chats.findIndex((chat) => {
      return chat.id === chatId
    })
    return deltachat.chats[index]
  }

  render () {
    const chat = this.getChat()

    return (<div>
      {this.state.error && this.state.error}
      <Back onClick={this.props.changeScreen} />
      <ConversationContext theme={theme}>
        {chat.messages.map((message) =>
          <li>
            <RenderMessage message={message} />
          </li>
        )}
      </ConversationContext>
      <div>
        <input
          onChange={this.handleChange}
          id='writeMessage'
          value={this.state.value}
          type='text'
          placeholder='Say something...' />
        <button type='submit' onClick={this.writeMessage.bind(this)}>Send</button>
      </div>
    </div>)
  }
}

class RenderMessage extends React.Component {
  render () {
    const { message } = this.props
    console.log(message)
    const timestamp = message.msg.timestamp * 1000
    const direction = message.isMe ? 'outgoing' : 'incoming'
    const contact = {
      onSendMessage: () => console.log('send a message to', message.fromId),
      onClick: () => console.log('clicking contact', message.fromId)
    }

    var props = {
      id: message.messageId,
      i18n: window.translate,
      conversationType: 'direct', // or group
      direction,
      contact,
      authorName: message.contact.name,
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
