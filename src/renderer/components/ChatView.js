const React = require('react')
const from = require('from2')
const CONSTANTS = require('deltachat-node/constants')
const { remote, ipcRenderer } = require('electron')
const fs = remote.require('fs')
const render = require('render-media')

const SetupMessageDialog = require('./dialogs/SetupMessage')
const Composer = require('./Composer')
const {
  Dialog
} = require('@blueprintjs/core')

let MutationObserver = window.MutationObserver

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
      setupMessage: false,
      attachmentMessage: null
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
    this.conversationDiv = document.querySelector('.message-list')
    this.observer = new MutationObserver(this.scrollToBottom)
    this.observer.observe(this.conversationDiv, { attributes: true, childList: true, subtree: true })
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

  onClickAttachment (attachmentMessage) {
    this.setState({ attachmentMessage })
  }

  onClickSetupMessage (setupMessage) {
    this.setState({ setupMessage })
  }

  onCloseAttachmentView () {
    this.setState({ attachmentMessage: null })
  }

  onSetupMessageClose () {
    // TODO: go back to main chat screen
    this.setState({ setupMessage: false })
  }

  render () {
    const { attachmentMessage, setupMessage } = this.state
    const chat = this.getChat()
    if (!chat) return <div />
    this.state.value = chat.textDraft

    return (
      <div>
        <Navbar fixedToTop>
          <NavbarGroup align={Alignment.LEFT}>
            <Button className={Classes.MINIMAL} icon='undo' onClick={this.props.changeScreen} />
            <img src={chat.profileImage} /> {chat.name}: {chat.subtitle}
          </NavbarGroup>
          <NavbarGroup align={Alignment.RIGHT}>
            <NavbarHeading>{chat.name}</NavbarHeading>
            <Popover content={<Menu>...</Menu>} position={Position.RIGHT_TOP}>
              <Button className={Classes.MINIMAL} icon='menu' />
            </Popover>
          </NavbarGroup>
        </Navbar>

        <SetupMessageDialog
          userFeedback={this.props.userFeedback}
          setupMessage={setupMessage}
          onClose={this.onSetupMessageClose}
        />
        <RenderMedia
          url={attachmentMessage && attachmentMessage.msg.file}
          close={this.onCloseAttachmentView.bind(this)}
        />

        <div id='the-conversation'>
          <ConversationContext theme={theme}>
            {chat.messages.map((message) => {
              const msg = <RenderMessage message={message} onClickAttachment={this.onClickAttachment.bind(this, message)} />
              if (message.msg.isSetupmessage) {
                return <li onClick={this.onClickSetupMessage.bind(this, message)}>
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

class RenderMedia extends React.Component {
  constructor (props) {
    super(props)
    this.ref = React.createRef()
  }
  onOpened () {
    const { url } = this.props
    if (url) {
      var data = fs.readFileSync(url)
      var file = {
        name: url,
        createReadStream: function (opts) {
          return from([data])
        }
      }
      render.append(file, this.ref.current)
    }
  }
  render () {
    const { url, close } = this.props
    this.el = document.createElement('div')
    return <Dialog isOpen={Boolean(url)}
      onOpened={this.onOpened.bind(this)}
      onClose={close}>
      <div ref={this.ref} />
    </Dialog>
  }
}

class RenderMessage extends React.Component {
  render () {
    const { onClickAttachment, message } = this.props
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
      onClickAttachment,
      authorName: message.contact.displayName,
      authorPhoneNumber: message.contact.address,
      status: convertMessageStatus(message.msg.state),
      timestamp
    }

    if (message.msg.file) {
      props.attachment = { url: message.msg.file, contentType: message.filemime, filename: message.msg.text }
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
