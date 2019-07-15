const React = require('react')
const { withTheme } = require('styled-components')

const { Button } = require('@blueprintjs/core')
const { remote } = require('electron')
const styled = require('styled-components').default
const { Picker } = require('emoji-mart')

const log = require('../../logger').getLogger('renderer/composer')
const SettingsContext = require('../contexts/SettingsContext')
const ComposerMessageInput = require('./ComposerMessageInput')

const ComposerWrapper = styled.div`
  background-color: ${props => props.theme.deltaPrimaryFg};
  border-left: 1px solid rgba(16,22,26,0.1);
`

const AttachmentButtonWrapper = styled.div`
  float: left;

  position: fixed;
  bottom: 0;

  .bp3-button.bp3-minimal {
    width: 40px;
    height: 40px;

    &:hover {
      background: none;
      cursor: pointer;
    }
    &:focus {
      outline: none;
    }
  }
`

const EmojiButtonWrapper = styled(AttachmentButtonWrapper)`
  height: 40px;
  right: 40px;
`

const IconButton = styled.button`
  height: 40px;
  width: 40px;
  margin-right: 0px !important;
  padding: 0px;
  border: 0;
  background-size: contain;
  background-repeat: no-repeat;
  background-color: white;
  &:focus {
    outline: none;
  }
`

const IconButtonSpan = styled.span`
  display: block
  width: 25px
  height: 25px
  margin: 0 auto;
  background-image: url(../images/emoji.png);
  background-size: contain
`

const EmojiPickerWrapper = styled.div`
  position: fixed;

  z-index: 10;
  width: 314px;
  right: 10px;
  bottom: 50px;

  .emoji-mart-emoji-native, .emoji-mart {
    font-family: inherit
  }

  .emoji-mart-category .emoji-mart-emoji span {
    height: auto !important;
    width: auto !important;
  }

  @media only screen and (max-height: 530px) {
    .emoji-mart-scroll {
      height: 100px;
    }
  }

  @media only screen and (max-width: 600px) {
    width: 272px;

    .emoji-mart-title-label {
      font-size: 20px;
    }
  }
`

const SendButtonCircleWrapper = styled.div`
  position: fixed;
  bottom: 0;
  right: 0;
  width: 32px;
  height: 32px;
  float: right;
  margin-top: 4px;
  margin-bottom: 4px;
  margin-right: 5px;
  background-color: ${props => props.theme.deltaPrimaryBg};
  border-radius: 180px;
  cursor: pointer;
  
  &:focus {
    outline: none;
  }
`

const SendButton = styled.button`
  height: 24px;
  width: 24px;
  margin: 4px;
  padding-left: 16px;
  border: none;
  background-image: url(../images/send-button.png);
  background-color: transparent;
  background-repeat: no-repeat;
  background-position: 3px 1px;
  background-size: contain;
  vertical-align: middle;
  
  &:focus {
    outline: none;
  }
`

class Composer extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      filename: null,
      error: false,
      showEmojiPicker: false

    }
    this.sendMessage = this.sendMessage.bind(this)
    this.onEmojiSelect = this.onEmojiSelect.bind(this)
    this.onMouseMove = this.onMouseMove.bind(this)

    this.messageInputRef = React.createRef()
    this.pickerRef = React.createRef()
    this.pickerButtonRef = React.createRef()
  }

  handleError () {
    this.setState({ error: true })
  }

  sendMessage () {
    let message = this.messageInputRef.current.getText()
    if (message.match(/^\s*$/)) {
      log.debug(`Empty message: don't send it...`)
      return
    }
    this.props.onSubmit({
      text: message
    })
    this.messageInputRef.current.clearText()
    this.messageInputRef.current.focus()
  }

  addFilename () {
    remote.dialog.showOpenDialog({
      properties: ['openFile']
    }, (filenames) => {
      if (filenames && filenames[0]) {
        this.props.onSubmit({ filename: filenames[0] })
      }
    })
  }

  showEmojiPicker (show) {
    if (show) {
      document.addEventListener('mousemove', this.onMouseMove)
    } else {
      document.removeEventListener('mousemove', this.onMouseMove)
    }
    this.setState({ showEmojiPicker: show })
  }

  onEmojiSelect (emoji) {
    log.debug(`EmojiPicker: Selected ${emoji.id}`)
    this.messageInputRef.current.insertStringAtCursorPosition(emoji.native)
  }

  onMouseMove (event) {
    let x = event.clientX
    let y = event.clientY
    if (this.state.showEmojiPicker === false) return

    let bounding = this.pickerRef.current.getBoundingClientRect()
    let boundingButton = this.pickerButtonRef.current.getBoundingClientRect()

    if (!this.insideBoundingRect(x, y, bounding, 10) &&
        !this.insideBoundingRect(x, y, boundingButton, 10)) {
      log.debug(`Closing EmojiPicker x: ${x} y: ${y}`)
      this.setState({ showEmojiPicker: false })
    }
  }

  insideBoundingRect (mouseX, mouseY, boundingRect, margin = 0) {
    return mouseX >= boundingRect.x - margin &&
           mouseX <= boundingRect.x + boundingRect.width + margin &&
           mouseY >= boundingRect.y - margin &&
           mouseY <= boundingRect.y + boundingRect.height + margin
  }

  render () {
    return (
      <ComposerWrapper ref='ComposerWrapper'>
        <AttachmentButtonWrapper>
          <Button minimal icon='paperclip' onClick={this.addFilename.bind(this)} />
        </AttachmentButtonWrapper>
        <SettingsContext.Consumer>
          {({ enterKeySends }) => (
            <ComposerMessageInput
              ref={this.messageInputRef}
              enterKeySends={enterKeySends}
              sendMessage={this.sendMessage}
              setComposerSize={this.props.setComposerSize}
              chatId={this.props.chatId}
              draft={this.props.draft}
            />
          )}
        </SettingsContext.Consumer>
        <EmojiButtonWrapper ref={this.pickerButtonRef}>
          <IconButton onClick={this.showEmojiPicker.bind(this, true)}>
            <IconButtonSpan />
          </IconButton>
        </EmojiButtonWrapper>
        { this.state.showEmojiPicker &&
          <EmojiPickerWrapper ref={this.pickerRef}>
            <Picker
              style={{ width: '100%', height: '100%' }}
              native
              color={this.props.theme.deltaPrimaryBg}
              onSelect={this.onEmojiSelect}
              showPreview={false}
              showSkinTones={false}
              emojiTooltip
            />
          </EmojiPickerWrapper>
        }
        <SendButtonCircleWrapper onClick={this.sendMessage}>
          <SendButton />
        </SendButtonCircleWrapper>
      </ComposerWrapper>
    )
  }
}
module.exports = withTheme(Composer)
