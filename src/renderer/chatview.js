const React = require('react')
const {ipcRenderer} = require('electron')

class ChatView extends React.Component {
  constructor (props) {
    super(props)
    this.back = this.back.bind(this)
  }

  back () {
    var chatId = this.props.screenProps.chatId
    ipcRenderer.send('dispatch', 'clearChatPage', chatId)
    this.props.changeScreen()
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
      <div>
        <button onClick={this.back}>Back</button>
      </div>
      <div>
        {chat.messages.map((message) => {
          return (<div> {message.msg.text} </div>)
        })}
      </div>
    </div>)
  }
}

module.exports = ChatView
