const React = require('react')
const {ipcRenderer} = require('electron')
const Chats = require('./chats')

class ChatView extends React.Component {
  back () {
    this.props.changeScreen(Chats)
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
        <button onClick={this.back.bind(this)}>Back</button>
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
