const React = require('react')
const CONSTANTS = require('deltachat-node/constants')
const {ipcRenderer} = require('electron')

const Back = require('./back')

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
    console.log(chat.messages)

    return (<div>
      {this.state.error && this.state.error}
      <Back onClick={this.props.changeScreen} />
      <div>
        {chat.messages.map((message) => <Message message={message} />)}
      </div>
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

class Message extends React.Component {
  render () {
    const {message} = this.props
    switch (message.msg.type) {
      case CONSTANTS.DC_MSG_IMAGE || CONSTANTS.DC_MSG_GIF:
        return (<div key={message.id}> <img src={message.msg.file} /></div>)
      default:
        return (<div key={message.id}> {message.msg.text} </div>)
    }
  }
}

module.exports = ChatView
