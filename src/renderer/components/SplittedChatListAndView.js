const React = require('react')
const KeyTransferDialog = require('./dialogs/KeyTransfer')
const DeadDropDialog = require('./dialogs/DeadDrop')
const ChatView = require('./ChatView')
const ChatList = require('./ChatList')
const { ipcRenderer } = require('electron')

const {
  Alignment,
  Classes,
  Navbar,
  NavbarGroup,
  NavbarHeading,
  Position,
  Menu,
  MenuItem,
  Popover,
  Button
} = require('@blueprintjs/core')

class SplittedChatListAndView extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      chat: {
        id: null,
        profileImage: null
      },
      deadDropChat: false,
      keyTransfer: false
    }
    this.onChatClick = this.onChatClick.bind(this)
    this.onDeadDropClose = this.onDeadDropClose.bind(this)
    this.onCreateChat = this.onCreateChat.bind(this)
    this.onCreateContact = this.onCreateContact.bind(this)
    this.initiateKeyTransfer = this.initiateKeyTransfer.bind(this)
    this.onKeyTransferComplete = this.onKeyTransferComplete.bind(this)
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

  onChatClick (chat) {
    console.log('Selected chatId', chat.id)
    this.setState({
      chat: chat
    })
  }

  render () {
    const { deltachat } = this.props
    const { deadDropChat, keyTransfer } = this.state

    const tx = window.translate

    const menu = (<Menu>
      <MenuItem icon='plus' text={tx('addContact')} onClick={this.onCreateContact} />
      <MenuItem icon='plus' text={tx('addChat')} onClick={this.onCreateChat} />
      <MenuItem icon='exchange' text={tx('initiateKeyTransferTitle')} onClick={this.initiateKeyTransfer} />
    </Menu>)

    return (
      <div>
        <KeyTransferDialog isOpen={keyTransfer} onClose={this.onKeyTransferComplete} />
        <DeadDropDialog deadDropChat={deadDropChat} onClose={this.onDeadDropClose} />
        <Navbar fixedToTop>
          <NavbarGroup align={Alignment.LEFT}>
            <Button className={Classes.MINIMAL} icon='log-out' onClick={this.logout} text={tx('logout')} />
            <NavbarHeading>{deltachat.credentials.email}</NavbarHeading>
          </NavbarGroup>
          <NavbarGroup align={Alignment.RIGHT}>
            <img src={this.state.chat.profileImage} />
            <NavbarHeading>{this.state.chat.name}</NavbarHeading>
            <div>{this.state.chat.subtitle}</div>
            <Popover content={menu} position={Position.RIGHT_TOP}>
              <Button className={Classes.MINIMAL} icon='menu' />
            </Popover>
          </NavbarGroup>

        </Navbar>
        <ChatList
          userFeedback={this.props.userFeedback}
          changeScreen={this.props.changeScreen}
          deltachat={this.props.deltachat}
          onChatClick={this.onChatClick}
        />
        <ChatView
          chatId={this.state.chat.id}
          userFeedback={this.props.userFeedback}
          changeScreen={this.props.changeScreen}
          deltachat={this.props.deltachat}
        />
      </div>
    )
  }
}

module.exports = SplittedChatListAndView
