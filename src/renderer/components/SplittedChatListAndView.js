const React = require('react')
const ChatView = require('./ChatView')
const ChatList = require('./ChatList')

class SplittedChatListAndView extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      chatId: null
    }
  }

  onChatClick (chat) {
    console.log('Selected chatId', chat.id)
    this.setState({
      chatId: chat.id
    })
  }

  render () {
    return (
      <div>
        <ChatList
          screenProps={this.props.screenProps}
          userFeedback={this.props.userFeedback}
          changeScreen={this.props.changeScreen}
          deltachat={this.props.deltachat}
          onChatClick={this.onChatClick.bind(this)}
        />
        <ChatView
          chatId={this.state.chatId}
          userFeedback={this.props.userFeedback}
          changeScreen={this.props.changeScreen}
          deltachat={this.props.deltachat}
          onChatClick={this.onChatClick}

        />
      </div>
    )
  }
}

module.exports = SplittedChatListAndView
