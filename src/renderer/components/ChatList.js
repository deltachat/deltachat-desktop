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
      deadDropContact: false
    }
    this.onDeadDropClose = this.onDeadDropClose.bind(this)
    this.onCreateChat = this.onCreateChat.bind(this)
  }

  onChatClick (chat) {
    this.props.changeScreen('ChatView', { chatId: chat.id })
  }

  onDeadDropClose () {
    this.setState({ deadDropContact: false })
  }

  onCreateChat () {
    this.props.changeScreen('CreateChat')
  }

  onDeadDropClick (chat) {
    // TODO: get contact from chat?
    this.setState({ deadDropContact: chat })
  }

  componentDidMount () {
    ipcRenderer.send('dispatch', 'loadChats')
  }

  logout () {
    // TODO
  }

  render () {
    const { deltachat } = this.props
    const { deadDropContact } = this.state

    return (
      <div>
        {this.state.error && this.state.error}
        <DeadDropDialog deadDropContact={deadDropContact} onDeadDropClose={this.onDeadDropClose} />
        <Navbar fixedToTop>
          <NavbarGroup align={Alignment.LEFT}>
            <Button className={Classes.MINIMAL} icon='log-out' onClick={this.logout} />
            <NavbarHeading>{deltachat.credentials.email}</NavbarHeading>
          </NavbarGroup>
          <NavbarGroup align={Alignment.RIGHT}>
            <Button className={Classes.MINIMAL} icon='plus' text='Chat' onClick={this.onCreateChat} />
          </NavbarGroup>
        </Navbar>
        <div className='window'>
          {deltachat.chats.map((chat) => {
            if (!chat) return
            if (chat.id === 1) {
              return (<div>
                // dead drop
                <Button onClick={this.onDeadDropClick.bind(this, chat)}>
                  New message from {chat.name}
                </Button>
              </div>)
            }
            return (
              <ConversationListItem
                key={chat.id}
                onClick={this.onChatClick.bind(this, chat)}
                phoneNumber={chat.summary.text1}
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
    this.close = this.close.bind(this)
  }

  yes () {
    ipcRenderer.send('dispatch', 'chatWithContact', this.props.deadDropContact.id)
    this.props.deadDropClose()
  }

  no () {
    this.props.deadDropClose()
  }

  close () {
    this.props.deadDropClose()
  }

  never () {
    ipcRenderer.send('dispatch', 'blockContact', this.props.deadDropContact.id)
    this.props.deadDropClose()
  }

  render () {
    const { deadDropContact } = this.props
    if (!deadDropContact) return <div />
    const title = `Chat with ${deadDropContact.address}?`
    return (
      <Dialog title={title} icon='info-sign' onClose={this.no} canOutsideClickClose={false}>
        <h3>{title}</h3>

        <ButtonGroup>
          <Button onClick={this.yes}> Yes </Button>
          <Button onClick={this.no}> No </Button>
          <Button onClick={this.never}> Never </Button>
        </ButtonGroup>
      </Dialog>
    )
  }
}

module.exports = ChatList
