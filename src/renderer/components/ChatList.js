const React = require('react')
const { ipcRenderer } = require('electron')
const { ConversationListItem } = require('conversations')

class ChatList extends React.Component {
  constructor (props) {
    super(props)
    console.log(props)
    this.state = {
      deadDropChat: false,
      keyTransfer: false
    }
    this.onDeadDropClose = this.onDeadDropClose.bind(this)
    this.onCreateChat = this.onCreateChat.bind(this)
    this.onCreateContact = this.onCreateContact.bind(this)
    this.initiateKeyTransfer = this.initiateKeyTransfer.bind(this)
    this.onKeyTransferComplete = this.onKeyTransferComplete.bind(this)
    this.onChatClick = props.onChatClick
  }

  onDeadDropClose () {
    this.setState({ deadDropChat: false })
  }

  onCreateContact () {
    var self = this

    const tx = window.translate

    var onSubmit = (chatId) => {
      if (chatId !== 0) {
        self.props.userFeedback({ type: 'success', text: tx('contactCreateSuccess') })
        self.props.changeScreen('ChatList')
      }
    }
    this.props.changeScreen('CreateContact', { onSubmit })
  }

  onCreateChat () {
    this.props.changeScreen('CreateChat')
  }

  onDeadDropClick (chat) {
    this.setState({ deadDropChat: chat })
  }

  componentDidMount () {}

  logout () {
    ipcRenderer.send('dispatch', 'logout')
  }

  onKeyTransferComplete () {
    this.setState({ keyTransfer: false })
  }

  initiateKeyTransfer () {
    this.setState({ keyTransfer: true })
  }

  render () {
    const { deltachat } = this.props

    const tx = window.translate

    return (
      <div class='ChatList'>

        <div className='window'>
          {deltachat.chats.map((chat) => {
            if (!chat) return
            const i18n = window.translate
            const lastUpdated = chat.summary.timestamp ? chat.summary.timestamp * 1000 : null
            if (chat.id === 1) {
              const name = `${tx('newMessageFrom')} ${chat.name}`
              return (
                <ConversationListItem
                  name={name}
                  i18n={i18n}
                  color={'purple'}
                  phoneNumber={chat.summary.text1}
                  lastUpdated={lastUpdated}
                  lastMessage={{
                    text: chat.summary.text2,
                    status: 'delivered'
                  }}
                  onClick={this.onDeadDropClick.bind(this, chat)}
                />)
            } else {
              return (
                <ConversationListItem
                  key={chat.id}
                  onClick={this.onChatClick.bind(this, chat)}
                  phoneNumber={chat.summary.text1}
                  name={chat.name}
                  lastUpdated={lastUpdated}
                  lastMessage={{
                    text: chat.summary.text2,
                    status: 'sent' // TODO: interpret data from summary to get correct state
                  }}
                  i18n={i18n} />
              )
            }
          })}
        </div>
      </div>
    )
  }
}

module.exports = ChatList
