const React = require('react')
const { ipcRenderer } = require('electron')
const { ConversationListItem } = require('conversations')

const {
  Alignment,
  Classes,
  Navbar,
  NavbarGroup,
  NavbarHeading,
  Button,
  ButtonGroup,
  Dialog
} = require('@blueprintjs/core')

class ChatList extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      deadDropChat: false
    }
    this.onDeadDropClose = this.onDeadDropClose.bind(this)
    this.onCreateChat = this.onCreateChat.bind(this)
  }

  onChatClick (chat) {
    this.props.changeScreen('ChatView', { chatId: chat.id })
  }

  onDeadDropClose () {
    this.setState({ deadDropChat: false })
  }

  onCreateChat () {
    this.props.changeScreen('CreateChat')
  }

  onDeadDropClick (chat) {
    console.log(chat)
    this.setState({ deadDropChat: chat })
  }

  componentDidMount () {
    ipcRenderer.send('dispatch', 'loadChats')
  }

  logout () {
    // TODO
  }

  render () {
    const { deltachat } = this.props
    const { deadDropChat } = this.state

    return (
      <div>
        {this.state.error && this.state.error}
        <DeadDropDialog deadDropChat={deadDropChat} onClose={this.onDeadDropClose} />
        <Navbar fixedToTop>
          <NavbarGroup align={Alignment.LEFT}>
            <Button className={Classes.MINIMAL} icon='log-out' onClick={this.logout} />
          </NavbarGroup>
          <NavbarGroup align={Alignment.RIGHT}>
            <Button className={Classes.MINIMAL} icon='plus' text='Chat' onClick={this.onCreateChat} />
          </NavbarGroup>
        </Navbar>
        <div className='window'>
          {deltachat.chats.map((chat) => {
            if (!chat) return
            const i18n = window.translate
            if (chat.id === 1) {
              const name = `New message from ${chat.name}`
              return (
                <ConversationListItem
                  name={name}
                  i18n={i18n}
                  color={'purple'}
                  phoneNumber={chat.summary.text1}
                  lastUpdated={chat.summary.timestamp * 1000}
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
                  lastUpdated={chat.summary.timestamp * 1000}
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

class DeadDropDialog extends React.Component {
  constructor (props) {
    super(props)
    this.yes = this.yes.bind(this)
    this.never = this.never.bind(this)
    this.close = this.close.bind(this)
  }

  yes () {
    ipcRenderer.send('dispatch', 'chatWithContact', this.props.deadDropChat.fromId)
    this.close()
  }

  close () {
    this.props.onClose()
  }

  never () {
    ipcRenderer.send('dispatch', 'blockContact', this.props.deadDropChat.fromId)
    this.close()
  }

  render () {
    const { deadDropChat } = this.props
    var name = deadDropChat && deadDropChat.summary.text1
    const title = `Chat with ${name}?`
    const isOpen = deadDropChat !== false
    console.log(deadDropChat)
    return (
      <Dialog
        isOpen={isOpen}
        title={title}
        icon='info-sign'
        onClose={this.close}
        canOutsideClickClose={false}>
        <ButtonGroup>
          <Button onClick={this.yes}> Yes </Button>
          <Button onClick={this.close}> No </Button>
          <Button onClick={this.never}> Never </Button>
        </ButtonGroup>
      </Dialog>
    )
  }
}

module.exports = ChatList
