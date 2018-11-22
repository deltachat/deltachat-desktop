const React = require('react')
const { ipcRenderer } = require('electron')

const dialogs = require('./dialogs')
const Composer = require('./Composer')
const Message = require('./Message')
const { ConversationContext } = require('./conversations')
const styled = require('styled-components').default

const MutationObserver = window.MutationObserver

const SCROLL_BUFFER = 70

const ChatViewWrapper = styled.div`
  width: 70%;
  background-color: #eeefef;
  float: right;

  #the-conversation {
    height: calc(100vh - 50px - 40px);
    overflow: scroll;
    background: white;
  }
`

const InputMessage = styled.div`
  .composer {
    width: 70%;
    background-color: #eeefef;
    padding: 4px 10px;
  }

  input:focus {
    outline: 0;
    -webkit-box-shadow: unset;
    box-shadow: 0 0 0 0 rgba(19, 124, 189, 0), 0 0 0 0 rgba(19, 124, 189, 0), inset 0 0 0 1px rgba(16, 22, 26, 0.15), inset 0 1px 1px rgba(16, 22, 26, 0.2);
  }
`

const RenderMediaWrapper = styled.div`
  .attachment-overlay {
    display: flex;
    justify-content: center;
  }
`

class ChatView extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      error: false,
      dialogProps: false
    }

    this.writeMessage = this.writeMessage.bind(this)
    this.onCloseDialog = this.onCloseDialog.bind(this)
    this.focusInputMessage = this.focusInputMessage.bind(this)
    this.scrollToBottom = this.scrollToBottom.bind(this)
    this.conversationDiv = React.createRef()
    this.lastId = this.props.chat.id
    this.previousScrollHeightMinusTop = null
  }

  componentWillUnmount () {
    if (this.observer) this.observer.disconnect()
  }

  writeMessage (opts) {
    const { chat } = this.props
    ipcRenderer.send('dispatch', 'sendMessage', chat.id, opts.text, opts.filename)
  }

  fetchNextMessages () {
    this.scrollPrepare()
    ipcRenderer.send('dispatch', 'fetchMessages')
  }

  handleScroll () {
    if (this.previousScrollHeightMinusTop !== null &&
       (!this.lastId || this.lastId === this.props.chat.id)) {
      this.restoreScroll()
    } else {
      this.scrollToBottom()
    }

    this.lastId = this.props.chat && this.props.chat.id
  }

  restoreScroll () {
    this.doc.scrollTop = this.doc.scrollHeight - this.previousScrollHeightMinusTop
    this.previousScrollHeightMinusTop = null
  }

  scrollPrepare () {
    this.previousScrollHeightMinusTop = this.doc.scrollHeight - this.doc.scrollTop
  }

  onScroll () {
    if (this.doc.scrollTop <= SCROLL_BUFFER) this.fetchNextMessages()
  }

  componentDidMount () {
    this.doc = document.querySelector(`.${ChatViewWrapper.styledComponentId} #the-conversation`)
    if (!this.doc) return console.log(`Didn't find .ChatViewWrapper #the-conversation element`)
    if (!this.observer && this.conversationDiv.current) {
      this.observer = new MutationObserver(this.handleScroll.bind(this))
      this.observer.observe(this.conversationDiv.current, { attributes: false, childList: true, subtree: true })
    }
    this.doc.onscroll = this.onScroll.bind(this)
    this.scrollToBottom()
    this.focusInputMessage()
  }

  scrollToBottom (force) {
    this.doc.scrollTop = this.doc.scrollHeight
  }

  focusInputMessage () {
    let el = document.querySelector(`.${InputMessage.styledComponentId} input`)
    if (!el) return console.log(`Didn't find .InputMessage input element`)

    el.focus()
  }

  onDeleteMessage (message) {
    message.onDelete()
    this.onMessageDetailClose()
  }

  onClickAttachment (attachmentMessage) {
    this.setState({ dialogProps: { attachmentMessage } })
  }

  onClickSetupMessage (setupMessage) {
    this.setState({ dialogProps: { setupMessage } })
  }

  onShowDetail (messageDetail) {
    this.setState({ dialogProps: { messageDetail } })
  }

  onCloseDialog () {
    this.setState({ dialogProps: false })
  }

  render () {
    const { dialogProps, messageDetail } = this.state
    const { chat } = this.props

    return (
      <ChatViewWrapper ref={this.ChatViewWrapperRef}>
        <dialogs.SetupMessage
          userFeedback={this.props.userFeedback}
          setupMessage={dialogProps.setupMessage}
          onClose={this.onCloseDialog}
        />
        <RenderMediaWrapper>
          <dialogs.RenderMedia
            message={dialogProps.attachmentMessage}
            onClose={this.onCloseDialog}
          />
        </RenderMediaWrapper>
        <dialogs.MessageDetail
          onDelete={this.onDeleteMessage.bind(this, messageDetail)}
          chat={chat}
          message={dialogProps.messageDetail}
          onClose={this.onCloseDialog}
        />
        <div id='the-conversation' ref={this.conversationDiv}>
          <ConversationContext>
            {chat.messages.map(rawMessage => {
              var message = Message.convert(rawMessage)
              return Message.render({
                message,
                chat,
                onClickSetupMessage: this.onClickSetupMessage.bind(this, message),
                onShowDetail: this.onShowDetail.bind(this, message),
                onClickAttachment: this.onClickAttachment.bind(this, message)
              })
            })}
          </ConversationContext>
        </div>
        <InputMessage>
          <Composer onSubmit={this.writeMessage} />
        </InputMessage>
      </ChatViewWrapper>
    )
  }
}

module.exports = ChatView
