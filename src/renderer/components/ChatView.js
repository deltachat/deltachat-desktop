const React = require('react')
const { ipcRenderer, shell } = require('electron')
const styled = require('styled-components').default
const ScreenContext = require('../contexts/ScreenContext')

const Composer = require('./Composer')
const MessageWrapper = require('./MessageWrapper')
const log = require('../../logger').getLogger('renderer/chatView')

const { isDisplayableByRenderMedia } = require('./Attachment')

const MutationObserver = window.MutationObserver

const SCROLL_BUFFER = 70

const ChatViewWrapper = styled.div`
  width: 70%;
  float: right;
  display: grid;
  grid-template-columns: auto;
  height: calc(100vh - 50px);
  margin-top: 50px;
  background-image: ${props => props.theme.chatViewBgImgPath};
  background-size: cover;
  background-color: ${props => props.theme.chatViewBg};

}
`
const ConversationWrapper = styled.div`
  position: relative;

  #the-conversation {
    position: absolute;
    bottom: 0;
    overflow: scroll;
    max-height: 100%;
    width:100%;
    padding: 0 0.5em;
  }

  ul {
    list-style: none;
    
    li {
      margin-bottom: 10px;

      .message-wrapper {
        margin-left: 16px;
        margin-right: 16px;
      }

      &::after {
        visibility: hidden;
        display: block;
        font-size: 0;
        content: ' ';
        clear: both;
        height: 0;
      }
    }
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
    background-color: ${props => props.theme.messageIncommingBg};
  }

  .module-message__container--outgoing {
    background-color: ${props => props.theme.messageOutgoingBg};

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

  .module-message__author, .module-message__text {
    color: ${props => props.theme.messageText};
  }

  .module-message__metadata__date--incoming {
    color: ${props => props.theme.messageIncommingDate};
  }
`

class ChatView extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      error: false,
      composerSize: 40
    }

    this.writeMessage = this.writeMessage.bind(this)
    this.scrollToBottom = this.scrollToBottom.bind(this)
    this.conversationDiv = React.createRef()
    this.lastId = this.props.chat.id
    this.previousScrollHeightMinusTop = null

    this.conversationRef = React.createRef()
    this.refComposer = React.createRef()
  }

  componentWillUnmount () {
    if (this.observer) this.observer.disconnect()
  }

  writeMessage (opts) {
    const { chat } = this.props
    ipcRenderer.send(
      'EVENT_DC_FUNCTION_CALL',
      'sendMessage',
      chat.id,
      opts.text,
      opts.filename
    )
  }

  fetchNextMessages () {
    const { chat } = this.props
    if (chat.totalMessages === chat.messages.length) return
    this.scrollPrepare()
    ipcRenderer.send(
      'EVENT_DC_FUNCTION_CALL',
      'fetchMessages',
      chat.id
    )
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
    if (!this.doc) return log.warn(`Didn't find .ChatViewWrapper #the-conversation element`)
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

  onClickAttachment (message) {
    if (isDisplayableByRenderMedia(message.msg.attachment)) {
      this.context.openDialog('RenderMedia', { message })
    } else {
      if (!shell.openItem(message.msg.attachment.url)) {
        log.info("file couldn't be opened, try saving it in a different place and try to open it from there")
      }
    }
  }

  onClickSetupMessage (setupMessage) {
    this.context.openDialog('EnterAutocryptSetupMessage', { setupMessage })
  }

  onShowDetail (message) {
    const { chat } = this.props
    this.context.openDialog('MessageDetail', {
      message,
      chat
    })
  }

  onForward (forwardMessage) {
    this.context.openDialog('ForwardMessage', { forwardMessage })
  }

  setComposerSize (size) {
    this.setState({ composerSize: size })
  }

  onDrop (e) {
    const files = e.target.files || e.dataTransfer.files
    const { chat } = this.props
    e.preventDefault()
    e.stopPropagation()
    // TODO maybe add a clause here for windows because that uses backslash instead of slash
    const forbiddenPathRegEx = /DeltaChat\/[\d\w]*\/db\.sqlite-blobs\//gi
    for (let i = 0; i < files.length; i++) {
      const { path } = files[i]
      if (!forbiddenPathRegEx.test(path.replace('\\', '/'))) {
        ipcRenderer.send(
          'EVENT_DC_FUNCTION_CALL',
          'sendMessage',
          chat.id,
          null,
          path
        )
      } else {
        log.warn('Prevented a file from being send again while dragging it out')
      }
    }
  }

  onDragOver (e) {
    e.preventDefault()
    e.stopPropagation()
  }

  render () {
    const { onDeadDropClick, chat } = this.props
    return (
      <ChatViewWrapper
        style={{ gridTemplateRows: `auto ${this.state.composerSize}px` }}
        ref={this.ChatViewWrapperRef} onDrop={this.onDrop.bind({ props: { chat } })} onDragOver={this.onDragOver} >
        <ConversationWrapper>
          <div id='the-conversation' ref={this.conversationDiv}>
            <ul>
              {chat.messages.map(rawMessage => {
                const message = MessageWrapper.convert(rawMessage)
                message.onReply = () => log.debug('reply to', message)
                message.onForward = this.onForward.bind(this, message)
                return MessageWrapper.render({
                  message,
                  chat,
                  onClickContactRequest: () => onDeadDropClick(message),
                  onClickSetupMessage: this.onClickSetupMessage.bind(this, message),
                  onShowDetail: this.onShowDetail.bind(this, message),
                  onClickAttachment: this.onClickAttachment.bind(this, message)
                })
              })}
            </ul>
          </div>
        </ConversationWrapper>
        <Composer
          ref={this.refComposer}
          chatId={chat.id}
          draft={chat.draft}
          onSubmit={this.writeMessage}
          setComposerSize={this.setComposerSize.bind(this)}
        />
      </ChatViewWrapper>
    )
  }
}
ChatView.contextType = ScreenContext

module.exports = ChatView
