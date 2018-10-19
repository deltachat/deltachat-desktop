const React = require('react')

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
      selectedChatId: this.getInitialChatId()
    }

    this.onChatClick = this.onChatClick.bind(this)
  }

  // Returns the chat which will be shown on startup
  getInitialChatId() {
    const { deltachat } = this.props
    if(deltachat.chats.length == 0) return null
    return deltachat.chats[0].id
  }

  getSelectedChat() {
    const { deltachat } = this.props

    let selectedChat = null
    for (let i = 0; i<deltachat.chats.length; i++) {
      let chat = deltachat.chats[i]
      if(chat.id === this.state.selectedChatId) selectedChat = chat
    }
    return selectedChat
  }

  onChatClick (chatId) {
    this.setState({ selectedChatId: chatId })
  }

  render () {
    const { deltachat } = this.props
    const { selectedChatId } = this.state
    const tx = window.translate

    const selectedChat = this.getSelectedChat()

    const menu = (<Menu>
      <MenuItem icon='plus' text={tx('addContact')} onClick={this.onCreateContact} />
      <MenuItem icon='plus' text={tx('addChat')} onClick={this.onCreateChat} />
      <MenuItem icon='plus' text={tx('createGroup')} onClick={this.onCreateGroup} />
      <MenuItem icon='exchange' text={tx('initiateKeyTransferTitle')} onClick={this.initiateKeyTransfer} />
    </Menu>)

    return (
      <div>
        <div className="Navbar">
          <Navbar fixedToTop>
            <NavbarGroup align={Alignment.LEFT}>
              <Button className={Classes.MINIMAL} icon='log-out' onClick={this.logout} text={tx('logout')} />
              <NavbarHeading>{deltachat.credentials.email}</NavbarHeading>
            </NavbarGroup>
            <NavbarGroup align={Alignment.RIGHT}>
              <img src={selectedChat ? selectedChat.profileImage : null} />
              <NavbarHeading>{selectedChat ? selectedChat.name : 'No chat selected'}</NavbarHeading>
              <div>{selectedChat ? selectedChat.subtitle : ''}</div>
              <Popover content={menu} position={Position.RIGHT_TOP}>
                <Button className={Classes.MINIMAL} icon='menu' />
              </Popover>
            </NavbarGroup>
          </Navbar>
        </div>

        <ChatList
          screenProps={this.props.screenProps}
          userFeedback={this.props.userFeedback}
          changeScreen={this.props.changeScreen}
          deltachat={this.props.deltachat}
          onChatClick={this.onChatClick}
          selectedChatId={selectedChatId}/>
        <ChatView
          screenProps={this.props.screenProps}
          userFeedback={this.props.userFeedback}
          changeScreen={this.props.changeScreen}
          chatId={selectedChatId}
          deltachat={this.props.deltachat}/>

      </div>
    )
  }
}

module.exports = SplittedChatListAndView
