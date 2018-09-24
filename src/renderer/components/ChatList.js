const React = require('react')
const { ipcRenderer } = require('electron')
const { ConversationListItem } = require('conversations')

const KeyTransferDialog = require('./dialogs/KeyTransfer')
const DeadDropDialog = require('./dialogs/DeadDrop')

const {
  Alignment,
  Classes,
  Navbar,
  NavbarGroup,
  Position,
  Menu,
  MenuItem,
  Popover,
  Button
} = require('@blueprintjs/core')

class ChatList extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      deadDropChat: false,
      keyTransfer: false
    }
    this.onDeadDropClose = this.onDeadDropClose.bind(this)
    this.onCreateChat = this.onCreateChat.bind(this)
    this.onCreateContact = this.onCreateContact.bind(this)
    this.initiateKeyTransfer = this.initiateKeyTransfer.bind(this)
    this.onKeyTransferComplete = this.onKeyTransferComplete.bind(this)
  }

  onChatClick (chat) {
    this.props.changeScreen('ChatView', { chatId: chat.id })
  }

  onDeadDropClose () {
    this.setState({ deadDropChat: false })
  }

  onCreateContact () {
    var self = this
    var onSubmit = (id) => {
      if (id !== 0) {
        self.props.userFeedback({ type: 'success', text: 'Contact created successfully.' })
        this.props.changeScreen('ChatList')
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

  componentDidMount () {
    ipcRenderer.send('dispatch', 'loadChats')
  }

  logout () {
    // TODO
  }

  onKeyTransferComplete () {
    this.setState({ keyTransfer: false })
  }

  initiateKeyTransfer () {
    this.setState({ keyTransfer: true })
  }

  render () {
    const { deltachat } = this.props
    const { deadDropChat, keyTransfer } = this.state
    const tx = window.translate

    const menu = (<Menu>
      <MenuItem icon='exchange' text={tx('initiateKeyTransferTitle')} onClick={this.initiateKeyTransfer} />
    </Menu>)

    return (
      <div>
        <KeyTransferDialog isOpen={keyTransfer} onClose={this.onKeyTransferComplete} />
        <DeadDropDialog deadDropChat={deadDropChat} onClose={this.onDeadDropClose} />
        <Navbar fixedToTop>
          <NavbarGroup align={Alignment.LEFT}>
            <Button className={Classes.MINIMAL} icon='log-out' onClick={this.logout} text='Logout' />
          </NavbarGroup>
          <NavbarGroup align={Alignment.RIGHT}>
            <Button className={Classes.MINIMAL} icon='plus' text='Contact' onClick={this.onCreateContact} />
            <Button className={Classes.MINIMAL} icon='plus' text='Chat' onClick={this.onCreateChat} />
            <Popover content={menu} position={Position.RIGHT_TOP}>
              <Button className={Classes.MINIMAL} icon='menu' />
            </Popover>
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

module.exports = ChatList
