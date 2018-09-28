const React = require('react')
const CONSTANTS = require('deltachat-node/constants')
const { ipcRenderer } = require('electron')

const SetupMessageDialog = require('./dialogs/SetupMessage')
const Composer = require('./Composer')

const {
  Alignment,
  Classes,
  Navbar,
  Position,
  Menu,
  Popover,
  NavbarGroup,
  NavbarHeading,
  Button
} = require('@blueprintjs/core')

const { Message } = require('conversations').conversation
const { ConversationContext } = require('conversations').styleguide

var theme = 'light-theme' // user prefs?

class ChatView extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      error: false,
      setupMessage: false
    }
    this.onSetupMessageClose = this.onSetupMessageClose.bind(this)
    this.scrollToBottom = this.scrollToBottom.bind(this)
  }

  writeMessage (message) {
    var chatId = this.props.screenProps.chatId
    ipcRenderer.send('dispatch', 'sendMessage', chatId, message)
  }

  componentWillUnmount () {
    var chatId = this.props.screenProps.chatId
    ipcRenderer.send('dispatch', 'clearChatPage', chatId)
    this.observer.disconnect()
  }

  componentDidMount () {
    var chatId = this.props.screenProps.chatId
    ipcRenderer.send('dispatch', 'loadChats', chatId)
    this.conversationDiv = document.querySelector('#the-conversation')
    this.observer = new MutationObserver(this.scrollToBottom)
    this.observer.observe(this.conversationDiv, {attributes: true, childList: true, subtree: true})
    this.scrollToBottom()
  }

  getChat () {
    const { deltachat } = this.props
    var chatId = this.props.screenProps.chatId
    var index = deltachat.chats.findIndex((chat) => {
      return chat.id === chatId
    })
    return deltachat.chats[index]
  }

  scrollToBottom (force) {
    var doc = document.querySelector('html')
    doc.scrollTop = doc.scrollHeight
  }

  clickSetupMessage (setupMessage) {
    this.setState({ setupMessage })
  }

  onSetupMessageClose () {
    // TODO: go back to main chat screen
    this.setState({ setupMessage: false })
  }

  render () {
    const { setupMessage } = this.state
    const chat = this.getChat()
    if (!chat) return <div />
    this.state.value = chat.textDraft

    return (
      <div>
        <SetupMessageDialog
          userFeedback={this.props.userFeedback}
          setupMessage={setupMessage}
          onClose={this.onSetupMessageClose}
        />
        <Navbar fixedToTop>
          <NavbarGroup align={Alignment.LEFT}>
            <Button className={Classes.MINIMAL} icon='undo' onClick={this.props.changeScreen} />
          </NavbarGroup>
          <NavbarGroup align={Alignment.RIGHT}>
            <NavbarHeading>{chat.name}</NavbarHeading>
            <Popover content={<Menu>...</Menu>} position={Position.RIGHT_TOP}>
              <Button className={Classes.MINIMAL} icon='menu' />
            </Popover>
          </NavbarGroup>
        </Navbar>
        {this.state.error && this.state.error}
        <div id='the-conversation'>
          <ConversationContext theme={theme}>
            {chat.messages.map((message) => {
              const msg = <RenderMessage message={message} />
              if (message.msg.isSetupmessage) {
                return <li onClick={this.clickSetupMessage.bind(this, message)}>
                  {msg}
                </li>
              }

              return <li>{msg}</li>
            })}
          </ConversationContext>
        </div>
        <Composer onSubmit={this.writeMessage.bind(this)} />
      </div>
    )
  }
}

class RenderMessage extends React.Component {
  render () {
    const { message } = this.props
    const timestamp = message.msg.timestamp * 1000
    const direction = message.isMe ? 'outgoing' : 'incoming'
    const contact = {
      onSendMessage: () => console.log('send a message to', message.fromId),
      onClick: () => console.log('clicking contact', message.fromId)
    }

    var props = {
      id: message.id,
      i18n: window.translate,
      conversationType: 'direct', // or group
      direction,
      contact,
      authorName: message.contact.displayName,
      authorPhoneNumber: message.contact.address,
      status: convertMessageStatus(message.msg.state),
      timestamp
    }

    if (message.msg.file) {
      props.attachment = { url: message.msg.file, contentType: message.filemime }
    } else {
      props.text = message.msg.text
    }

    return (<Message {...props} />)
  }
}

function convertMessageStatus (s) {
  switch (s) {
    case CONSTANTS.DC_STATE_IN_FRESH:
      return 'sent'
    case CONSTANTS.DC_STATE_OUT_FAILED:
      return 'error'
    case CONSTANTS.DC_STATE_IN_SEEN:
      return 'read'
    case CONSTANTS.DC_STATE_IN_NOTICED:
      return 'read'
    case CONSTANTS.DC_STATE_OUT_DELIVERED:
      return 'delivered'
    case CONSTANTS.DC_STATE_OUT_MDN_RCVD:
      return 'read'
    case CONSTANTS.DC_STATE_OUT_PENDING:
      return 'sending'
    case CONSTANTS.DC_STATE_UNDEFINED:
      return 'error'
  }
}

module.exports = ChatView
