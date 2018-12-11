const React = require('react')
const { ipcRenderer } = require('electron')

const dialogs = require('./dialogs')
const Composer = require('./Composer')
const MessageWrapper = require('./MessageWrapper')
const { ConversationContext } = require('./conversations')
const styled = require('styled-components').default
const StyleVariables = require('./style-variables')

const MutationObserver = window.MutationObserver

const SCROLL_BUFFER = 70

const ChatViewWrapper = styled.div`
  width: 70%;
  background-color: #eeefef;
  float: right;

  #the-conversation {
    height: calc(100vh - 50px - 40px);
    overflow: scroll;
    background-image: url("../images/background_hd.jpg");
    background-size: cover;
  }

  .conversation, .discussion-container {
    background-color: inherit;
  }

  .module-message__author-default-avatar {
    align-self: flex-end;
  }

  .module-message__container {
    &, & .module-message__attachment-container {
      border-radius: 16px 16px 16px 1px;
    }
  }

  .module-message__container--incoming {
    background-color: ${StyleVariables.colors.deltaChatMessageBubbleOther};
  }

  .module-message__container--outgoing {
    background-color: ${StyleVariables.colors.deltaChatMessageBubbleSelf};

    &, & .module-message__attachment-container {
      border-radius: 16px 16px 1px 16px;
    }
  }

  .module-message__attachment-container--with-content-above {
    border-top-left-radius: 0px !important;
    border-top-right-radius: 0px !important;
  }

  .module-message__attachment-container--with-content-below {
    border-bottom-left-radius: 0px !important;
    border-bottom-right-radius: 0px !important;
  }

  .module-message__text--incoming {
    color: unset;
  }

  .module-message__author, .module-message__text {
    color: ${StyleVariables.colors.deltaChatPrimaryFg};
  }

  .module-message__metadata__date--incoming {
    color: ${StyleVariables.colors.deltaChatPrimaryFgLight};
  }
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
    const chat = this.props.chat
    if (chat.totalMessages === chat.messages.length) return
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
  }

  scrollToBottom (force) {
    this.doc.scrollTop = this.doc.scrollHeight
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

  onForward (forwardMessage) {
    this.setState({ dialogProps: { forwardMessage } })
  }

  render () {
    const { dialogProps, messageDetail } = this.state
    const { chat } = this.props

    return (
      <ChatViewWrapper ref={this.ChatViewWrapperRef}>
        <RenderMediaWrapper>
          <dialogs.RenderMedia
            message={dialogProps.attachmentMessage}
            onClose={this.onCloseDialog}
          />
        </RenderMediaWrapper>
        <dialogs.SetupMessage
          userFeedback={this.props.userFeedback}
          setupMessage={dialogProps.setupMessage}
          onClose={this.onCloseDialog}
        />
        <dialogs.ForwardMessage
          forwardMessage={dialogProps.forwardMessage}
          onClose={this.onCloseDialog}
        />
        <dialogs.MessageDetail
          onDelete={this.onDeleteMessage.bind(this, messageDetail)}
          chat={chat}
          message={dialogProps.messageDetail}
          onClose={this.onCloseDialog}
        />
        <div id='the-conversation' ref={this.conversationDiv}>
          <ConversationContext>
            {chat.messages.map(rawMessage => {
              var message = MessageWrapper.convert(rawMessage)
              message.onReply = () => {
                console.log('reply to', message)
              }
              message.onForward = this.onForward.bind(this, message)
              return MessageWrapper.render({
                message,
                chat,
                onClickSetupMessage: this.onClickSetupMessage.bind(this, message),
                onShowDetail: this.onShowDetail.bind(this, message),
                onClickAttachment: this.onClickAttachment.bind(this, message)
              })
            })}
          </ConversationContext>
        </div>
        <Composer onSubmit={this.writeMessage} />
      </ChatViewWrapper>
    )
  }
}

module.exports = ChatView
