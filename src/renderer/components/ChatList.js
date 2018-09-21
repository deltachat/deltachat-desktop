const React = require('react')
const { ipcRenderer } = require('electron')
const { ConversationListItem } = require('conversations')

const ChatView = require('./ChatView')
const KeyTransferDialog = require('./dialogs/KeyTransfer')
const DeadDropDialog = require('./dialogs/DeadDrop')

const {
  Alignment,
  Classes,
  Navbar,
  NavbarHeading,
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
      keyTransfer: false,
      selectedChat: false
    }
    this.onDeadDropClose = this.onDeadDropClose.bind(this)
    this.onCreateChat = this.onCreateChat.bind(this)
    this.initiateKeyTransfer = this.initiateKeyTransfer.bind(this)
    this.onKeyTransferComplete = this.onKeyTransferComplete.bind(this)
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

  getChat () {
    const { deltachat } = this.props
    var chatId = this.props.screenProps.chatId
    var index = deltachat.chats.findIndex((chat) => {
      return chat.id === chatId
    })
    return deltachat.chats[index]
  }

  selectChat (chat) {
    // TODO: only load messages when chat selected
    // var chatId = chat.id
    // ipcRenderer.send('dispatch', 'loadMessages', chatId)
    this.setState({ selectedChat: chat })
  }

  componentDidMount () {
    ipcRenderer.send('dispatch', 'loadChats')
    const chat = this.getChat()
    if (chat) this.selectChat(chat)
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
    const { selectedChat, deadDropChat, keyTransfer } = this.state
    const tx = window.translate

    const menu = (<Menu>
      <MenuItem icon='exchange' text={tx('initiateKeyTransferTitle')} onClick={this.initiateKeyTransfer} />
    </Menu>)

    return (
      <div>
        {this.state.error && this.state.error}
        <div className='fixed-list'>
          <KeyTransferDialog isOpen={keyTransfer} onClose={this.onKeyTransferComplete} />
          <DeadDropDialog deadDropChat={deadDropChat} onClose={this.onDeadDropClose} />
          <Navbar fixedToTop>
            <NavbarGroup align={Alignment.LEFT}>
              <Button className={Classes.MINIMAL} icon='log-out' onClick={this.logout} text='Logout' />
            </NavbarGroup>
            <NavbarGroup align={Alignment.RIGHT}>
              <Button className={Classes.MINIMAL} icon='plus' text='Chat' onClick={this.onCreateChat} />
              <Popover content={menu} position={Position.RIGHT_TOP}>
                <Button className={Classes.MINIMAL} icon='menu' />
              </Popover>
            </NavbarGroup>
          </Navbar>
          <div>
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
                    onClick={this.selectChat.bind(this, chat)}
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
        <div className='window fixed-conversations'>
          {selectedChat && <ChatView chat={selectedChat} />}
        </div>
      </div>
    )
  }
}

module.exports = ChatList
