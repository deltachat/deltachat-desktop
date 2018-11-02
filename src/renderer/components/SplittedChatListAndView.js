const React = require('react')
const C = require('deltachat-node/constants')
const { ipcRenderer } = require('electron')

const dialogs = require('./dialogs')
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
      keyTransfer: false
    }

    this.onShowArchivedChats = this.showArchivedChats.bind(this, true)
    this.onHideArchivedChats = this.showArchivedChats.bind(this, false)

    this.onChatClick = this.onChatClick.bind(this)
    this.onArchiveChat = this.onArchiveChat.bind(this)
    this.onDeleteChat = this.onDeleteChat.bind(this)
    this.onEditGroup = this.onEditGroup.bind(this)
    this.onDeadDropClick = this.onDeadDropClick.bind(this)
    this.onDeadDropClose = this.onDeadDropClose.bind(this)
    this.onCreateChat = this.onCreateChat.bind(this)
    this.initiateKeyTransfer = this.initiateKeyTransfer.bind(this)
    this.onKeyTransferComplete = this.onKeyTransferComplete.bind(this)
    this.onUnblockContacts = this.onUnblockContacts.bind(this)
    this.onBlockContact = this.onBlockContact.bind(this)
  }

  showArchivedChats (show) {
    ipcRenderer.send('dispatch', 'showArchivedChats', show)
  }

  onChatClick (chatId) {
    ipcRenderer.send('dispatch', 'selectChat', chatId)
  }

  onArchiveChat (selectedChat, archive) {
    ipcRenderer.send('dispatch', 'archiveChat', selectedChat.id, archive)
  }

  onDeleteChat (chat) {
    const tx = window.translate
    const message = tx('dialogs.deleteChat', chat.name)
    dialogs.confirmation(message, yes => {
      if (yes) {
        ipcRenderer.send('dispatch', 'deleteChat', chat.id)
      }
    })
  }

  onEditGroup (selectedChat) {
    this.props.changeScreen('EditGroup', { chat: selectedChat })
  }

  onLeaveGroup (selectedChat) {
    ipcRenderer.send('dispatch', 'leaveGroup', selectedChat.id)
  }

  onDeadDropClose () {
    this.setState({ deadDropChat: false })
  }

  onCreateChat () {
    this.props.changeScreen('CreateChat')
  }

  onDeadDropClick (chat) {
    this.setState({ deadDropChat: chat })
  }

  logout () {
    ipcRenderer.send('dispatch', 'logout')
  }

  onKeyTransferComplete () {
    this.setState({ keyTransfer: false })
  }

  onUnblockContacts () {
    this.props.changeScreen('UnblockContacts')
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

  onBlockContact (selectedChat) {
    const tx = window.translate
    if (selectedChat && selectedChat.contacts.length) {
      var contact = selectedChat.contacts[0]
      var message = tx('dialogs.blockContact', contact.displayName)
      dialogs.confirmation(message, yes => {
        if (yes) {
          ipcRenderer.sendSync('dispatchSync', 'blockContact', contact.id)
        }
      })
    }
  }

  render () {
    const { deltachat } = this.props
    const { selectedChat, showArchivedChats } = deltachat
    const { deadDropChat, keyTransfer } = this.state

    const isGroup = this.selectedChatIsGroup(selectedChat)
    const tx = window.translate

    const archiveMsg = isGroup ? tx('archiveGroup') : tx('archiveChat')
    const unArchiveMsg = isGroup ? tx('unArchiveGroup') : tx('unArchiveChat')
    const deleteMsg = isGroup ? tx('deleteGroup') : tx('deleteChat')

    const menu = (<Menu>
      <MenuItem icon='plus' text={tx('addChat')} onClick={this.onCreateChat} />
      {selectedChat && !showArchivedChats ? <MenuItem icon='import' text={archiveMsg} onClick={this.onArchiveChat.bind(this, selectedChat, true)} /> : null}
      {selectedChat && showArchivedChats ? <MenuItem icon='export' text={unArchiveMsg} onClick={this.onArchiveChat.bind(this, selectedChat, false)} /> : null}
      {selectedChat ? <MenuItem icon='delete' text={deleteMsg} onClick={this.onDeleteChat.bind(this, selectedChat)} /> : null}
      {selectedChat && !isGroup ? <MenuItem icon='blocked-person' text={tx('blockContact')} onClick={this.onBlockContact.bind(this, selectedChat)} /> : null}
      {isGroup ? <MenuItem icon='edit' text={tx('editGroup')} onClick={this.onEditGroup.bind(this, selectedChat)} /> : null}
      {isGroup ? <MenuItem icon='log-out' text={tx('leaveGroup')} onClick={this.onLeaveGroup.bind(this, selectedChat)} /> : null}
      <MenuItem icon='blocked-person' text={tx('unblockContacts')} onClick={this.onUnblockContacts} />
      <MenuItem icon='exchange' text={tx('initiateKeyTransferTitle')} onClick={this.initiateKeyTransfer} />
      <MenuItem icon='log-out' text={tx('logout')} onClick={this.logout} />
    </Menu>)

    return (
      <div>
        <div className='Navbar'>
          <Navbar fixedToTop>
            <NavbarGroup align={Alignment.LEFT}>
              { showArchivedChats && (<Button className={Classes.MINIMAL} icon='undo' onClick={this.onHideArchivedChats} />) }
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
        <dialogs.KeyTransfer isOpen={keyTransfer} onClose={this.onKeyTransferComplete} />
        <dialogs.DeadDrop deadDropChat={deadDropChat} onClose={this.onDeadDropClose} />
        <div className='below-navbar'>
          <ChatList
            chats={showArchivedChats ? deltachat.archivedChats : deltachat.chats}
            onDeadDropClick={this.onDeadDropClick}
            onShowArchivedChats={this.onShowArchivedChats}
            onChatClick={this.onChatClick}
            showArchivedChats={showArchivedChats}
            selectedChatId={selectedChat ? selectedChat.id : null}
          />
          {
            selectedChat
              ? (<ChatView
                screenProps={this.props.screenProps}
                userFeedback={this.props.userFeedback}
                changeScreen={this.props.changeScreen}
                chat={selectedChat}
                deltachat={this.props.deltachat} />)
              : (
                <div className='window centered'>
                  <h1>{tx('chatView.nochatselectedHeader')}</h1>
                  <p>{tx('chatView.nochatselectedSuggestion')}</p>
                </div>)
          }
        </div>

      </div>
    )
  }
}

module.exports = SplittedChatListAndView
