const React = require('react')
const {ipcRenderer} = require('electron')

const Back = require('./back')

class ChatView extends React.Component {
  comonentWillUnmount () {
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
    </div>)
  }
}

module.exports = ChatView
