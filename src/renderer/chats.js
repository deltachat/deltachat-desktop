const React = require('react')
const {ipcRenderer} = require('electron')
const {ConversationListItem} = require('conversations')

class Chats extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      deadDropContact: false
    }
    this.onDeadDropClose = this.onDeadDropClose.bind(this)
  }

  onChatClick (chat) {
    this.props.changeScreen('ChatView', {chatId: chat.id})
  }

  onDeadDropClose () {
    this.setState({deadDropContact: false})
  }

  onCreateChat () {
    this.props.changeScreen('CreateChat')
  }

  onDeadDropClick (chat) {
    // TODO: get contact from chat?
    this.setState({deadDropContact: chat})
  }

  componentDidMount () {
    ipcRenderer.send('dispatch', 'loadChats')
  }

  render () {
    const {deltachat} = this.props
    const {deadDropContact} = this.state

    return (
      <div>
        {this.state.error && this.state.error}
        <DeadDropDialog deadDropContact={deadDropContact} onDeadDropClose={this.onDeadDropClose} />
        <div className='header'>
          <div>
            {deltachat.credentials.email}
          </div>
          <button onClick={this.onCreateChat.bind(this)}>
            + Chat
          </button>
        </div>

        <div className='list-messages'>
          {deltachat.chats.map((chat) => {
            if (!chat) return
            if (chat.id === 1) {
              return (<div>
                <button onClick={this.onDeadDropClick.bind(this, chat)}>
                  New message from {chat.name}
                </button>
              </div>)
            }
            return (
              <ConversationListItem
                onClick={this.onChatClick.bind(this, chat)}
                phoneNumber="(202) 555-0011"
                name={chat.name}
                lastUpdated={chat.summary.timestamp * 1000}
                lastMessage={{
                  text: chat.summary.text2,
                  status: 'sent'
                }}
                i18n={window.translate} />
            )
          })}
        </div>
      </div>
    )
  }
}

class DeadDropDialog extends React.Component {
  constructor (props) {
    super(props)
    this.yes = this.yes.bind(this)
    this.no = this.no.bind(this)
    this.never = this.never.bind(this)
  }

  yes () {
    ipcRenderer.send('dispatch', 'chatWithContact', this.props.deadDropContact.id)
    this.props.deadDropClose()
  }

  no () {
    this.props.deadDropClose()
  }

  never () {
    ipcRenderer.send('dispatch', 'blockContact', this.props.deadDropContact.id)
    this.props.deadDropClose()
  }

  render () {
    const {deadDropContact} = this.props
    if (!deadDropContact) return <div />
    return (
      <div>
        <h3>Chat with {deadDropContact.address}?</h3>

        <div>
          <button onClick={this.yes}> Yes </button>
          <button onClick={this.no}> No </button>
          <button onClick={this.never}> Never </button>
        </div>
      </div>
    )
  }
}

module.exports = Chats
