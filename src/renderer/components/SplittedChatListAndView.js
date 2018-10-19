const React = require('react')
const C = require('deltachat-node/constants')
const { ipcRenderer } = require('electron')

const KeyTransferDialog = require('./dialogs/KeyTransfer')
const DeadDropDialog = require('./dialogs/DeadDrop')

const ChatList = require('./ChatList')
const ChatView = require('./ChatView')

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
      deadDropChat: false,
      keyTransfer: false,
      selectedChatId: this.getInitiallySelectedChatId()
    }

    this.onChatClick = this.onChatClick.bind(this)
    this.onArchiveChat = this.onArchiveChat.bind(this)
    this.onDeleteChat = this.onDeleteChat.bind(this)
    this.onEditGroup = this.onEditGroup.bind(this)
    this.onDeadDropClick = this.onDeadDropClick.bind(this)
    this.onDeadDropClose = this.onDeadDropClose.bind(this)
    this.onCreateChat = this.onCreateChat.bind(this)
    this.onCreateGroup = this.onCreateGroup.bind(this)
    this.onCreateContact = this.onCreateContact.bind(this)
    this.initiateKeyTransfer = this.initiateKeyTransfer.bind(this)
    this.onKeyTransferComplete = this.onKeyTransferComplete.bind(this)
  }

  // Returns the chat which will be shown on startup
  getInitiallySelectedChatId () {
    const { chats } = this.props.deltachat
    const chat = chats.find(chat => chat.id !== C.DC_CHAT_ID_ARCHIVED_LINK)
    return chat ? chat.id : null
  }

  getSelectedChat () {
    const { chats } = this.props.deltachat
    const { selectedChatId } = this.state
    return chats.find(chat => chat.id === selectedChatId)
  }

  onChatClick (chatId) {
    this.setState({ selectedChatId: chatId })
  }

  onArchiveChat () {
    const chatId = this.state.selectedChatId
    this.state.selectedChatId = null
    ipcRenderer.send('dispatch', 'archiveChat', chatId)
  }

  onDeleteChat () {
    const chatId = this.state.selectedChatId
    this.state.selectedChatId = null
    ipcRenderer.send('dispatch', 'deleteChat', chatId)
  }

  onEditGroup (selectedChat) {
    this.props.changeScreen('EditGroup', { chatId: selectedChat.id, chatName: selectedChat.name })
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

  onCreateGroup () {
    this.props.changeScreen('CreateGroup')
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

  selectedChatIsGroup (selectedChat) {
    return [
      C.DC_CHAT_TYPE_GROUP,
      C.DC_CHAT_TYPE_VERIFIED_GROUP
    ].includes(selectedChat && selectedChat.type)
  }

  render () {
    const { deltachat } = this.props
    const { deadDropChat, keyTransfer } = this.state
    let { selectedChatId } = this.state

    if (!selectedChatId) {
      selectedChatId = this.state.selectedChatId = this.getInitiallySelectedChatId()
    }

    const selectedChat = this.getSelectedChat()
    const isGroup = this.selectedChatIsGroup(selectedChat)
    const tx = window.translate
    const archiveMsg = isGroup ? tx('archiveGroup') : tx('archiveChat')
    const deleteMsg = isGroup ? tx('deleteGroup') : tx('deleteChat')

    const menu = (<Menu>
      <MenuItem icon='plus' text={tx('addContact')} onClick={this.onCreateContact} />
      <MenuItem icon='plus' text={tx('addChat')} onClick={this.onCreateChat} />
      <MenuItem icon='plus' text={tx('createGroup')} onClick={this.onCreateGroup} />
      {selectedChat ? <MenuItem icon='compressed' text={archiveMsg} onClick={this.onArchiveChat} /> : null}
      {selectedChat ? <MenuItem icon='delete' text={deleteMsg} onClick={this.onDeleteChat} /> : null}
      {isGroup ? <MenuItem icon='edit' text={tx('editGroup')} onClick={this.onEditGroup.bind(this, selectedChat)} /> : null}
      <MenuItem icon='exchange' text={tx('initiateKeyTransferTitle')} onClick={this.initiateKeyTransfer} />
    </Menu>)

    return (
      <div>
        <div className='Navbar'>
          <Navbar fixedToTop>
            <NavbarGroup align={Alignment.LEFT}>
              <Button className={Classes.MINIMAL} icon='log-out' onClick={this.logout} text={tx('logout')} />
              <NavbarHeading>{deltachat.credentials.email}</NavbarHeading>
            </NavbarGroup>
            <NavbarGroup align={Alignment.RIGHT}>
              <img src={selectedChat ? selectedChat.profileImage : null} />
              <NavbarHeading>{selectedChat ? selectedChat.name : ''}</NavbarHeading>
              <div>{selectedChat ? selectedChat.subtitle : ''}</div>
              <Popover content={menu} position={Position.RIGHT_TOP}>
                <Button className={Classes.MINIMAL} icon='menu' />
              </Popover>
            </NavbarGroup>
          </Navbar>
        </div>
        <KeyTransferDialog isOpen={keyTransfer} onClose={this.onKeyTransferComplete} />
        <DeadDropDialog deadDropChat={deadDropChat} onClose={this.onDeadDropClose} />
        <div className='below-navbar'>
          <ChatList
            screenProps={this.props.screenProps}
            userFeedback={this.props.userFeedback}
            changeScreen={this.props.changeScreen}
            deltachat={this.props.deltachat}
            onDeadDropClick={this.onDeadDropClick}
            onChatClick={this.onChatClick}
            selectedChatId={selectedChatId} />
          {
            selectedChat &&
              (<ChatView
                screenProps={this.props.screenProps}
                userFeedback={this.props.userFeedback}
                changeScreen={this.props.changeScreen}
                chat={selectedChat}
                deltachat={this.props.deltachat} />)
          }
        </div>

      </div>
    )
  }
}

module.exports = SplittedChatListAndView
