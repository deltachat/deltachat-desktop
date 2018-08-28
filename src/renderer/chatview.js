const React = require('react')
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
    this.setState({value: undefined})
  }

  componentWillUnmount () {
    var chatId = this.props.screenProps.chatId
    ipcRenderer.send('dispatch', 'clearChatPage', chatId)
  }

  componentDidMount () {
    var chatId = this.props.screenProps.chatId
    ipcRenderer.send('dispatch', 'loadMessages', chatId)
  }

  render () {
    const {deltachat} = this.props
    var chatId = this.props.screenProps.chatId

    var index = deltachat.chats.findIndex((chat) => {
      return chat.id === chatId
    })

    var chat = deltachat.chats[index]

    return (<div>
      <Back onClick={this.props.changeScreen} />
      <div>
        {chat.messages.map((message) => {
          return (<div> {message.msg.text} </div>)
        })}
      </div>
      <div>
        <input onChange={this.handleChange} id='writeMessage' value={this.state.value} type='text' placeholder='Say something...' />
        <button type='submit' onClick={this.writeMessage.bind(this)}>Send</button>
      </div>
    </div>)
  }
}

module.exports = ChatView
