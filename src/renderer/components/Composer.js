const React = require('react')

const { Button } = require('@blueprintjs/core')
const { remote } = require('electron')
const StyleVariables = require('./style-variables')
const styled = require('styled-components').default
const log = require('../../logger').getLogger('renderer/composer')
const { Picker } = require('emoji-mart')

const ComposerWrapper = styled.div`
  height: 40px;
  background-color: ${StyleVariables.colors.deltaPrimaryFg};
  border-left: 1px solid rgba(16,22,26,0.1);
`

const AttachmentButtonWrapper = styled.div`
  float: left;
  button {
    margin-right: 10px;
  }

  .bp3-button.bp3-minimal {
    width: 40px;
    height: 40px;

    &:hover {
      background: none;
      cursor: pointer;
    }
  }
`

const IconButton = styled.button`
    margin-right: 10px;
    background-size: contain;
    background-repeat: no-repeat;
    background-color: white;
    height: 40px;
    margin: 0 auto;
    width: 40x;
    margin: 0px;
    border: 0;
`

const IconButtonSpan = styled.span`
    background-image: url(../images/emoji.png);
    width: 25px
    height: 25px
    display: block
    background-size: contain
`

const EmojiPickerWrapper = styled.div`
  position: absolute;

  z-index: 10;
  width: 30%;
  left: calc(30vw + 5px);
  bottom: 45px;

  .emoji-mart-emoji-native, .emoji-mart {
    font-family: inherit
  }

  @media only screen and (max-height: 530px) {
    .emoji-mart-scroll {
      height: 100px;
    }
  }

  @media only screen and (max-width: 1220px) {
    width: 50%;
  }
`

const MessageInput = styled.textarea`
  float: left;
  width: calc(100% - 140px);
  resize: unset;
  padding: 0px;
  border-color: transparent;
  height: 40px;
  line-height: 38px;


  &:focus {
    outline: none;
  }
`
const SendButtonCircleWrapper = styled.div`
  width: 32px;
  height: 32px;
  float: right;
  margin-top: 4px;
  margin-right: 5px;
  background-color: ${StyleVariables.colors.deltaPrimaryBg};
  border-radius: 180px;
  cursor: pointer;
`

const SendButton = styled.button`
  height: 24px;
  width: 24px;
  margin-top: 5px;
  margin-left: 8px;
  padding-left: 16px;
  background-image: url(../images/send-button.png);
  background-color: transparent;
  background-repeat: no-repeat;
  background-position: 0px 0px;
  border: none;
  vertical-align: middle;
  background-size: contain;
`

class Composer extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      filename: null,
      text: '',
      error: false,
      showEmojiPicker: false
    }
    this.minimumHeight = 48
    this.defaultHeight = 17 + this.minimumHeight
    this.clearInput = this.clearInput.bind(this)
    this.handleChange = this.handleChange.bind(this)
    this.sendMessage = this.sendMessage.bind(this)
    this.onEmojiSelect = this.onEmojiSelect.bind(this)
    this.onMouseMove = this.onMouseMove.bind(this)

    this.textareaRef = React.createRef()
    this.pickerRef = React.createRef()
    this.pickerButtonRef = React.createRef()
  }

  onKeyDown (e) {
    if (e.keyCode === 13 && e.shiftKey) {
      this.setState({ text: this.state.text + '\n' })
      e.preventDefault()
      e.stopPropagation()
    } else if (e.keyCode === 13 && !e.shiftKey) {
      this.sendMessage()
      e.preventDefault()
      e.stopPropagation()
    }
  }

  componentDidMount () {
    // TODO: this only happens on the first render
    // ideally, we'd pass the current chat id into the component
    // and focus the input message every time
    // the component changes chat ids, while rendering any cached unsent
    // previous message text (aka "draft" message)
    this.focusInputMessage()
  }

  handleError () {
    this.setState({ error: true })
  }

  sendMessage () {
    if (!this.state.text) return this.handleError()
    this.props.onSubmit({
      text: this.state.text
    })
    this.clearInput()
    this.focusInputMessage()
  }

  clearInput () {
    this.setState({ text: '', filename: null })
  }

  handleChange (e) {
    this.setState({ text: e.target.value, error: false })
  }

  focusInputMessage () {
    let el = document.querySelector(`.${ComposerWrapper.styledComponentId} textarea`)
    if (!el) return log.warn(`Didn't find .ComposerWrapper textarea element`)
    el.focus()
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
    let textareaElem = this.textareaRef.current
    let cursorPosition = textareaElem.selectionStart

    let updatedText = this.state.text.slice(0, cursorPosition) + emoji.native + this.state.text.slice(cursorPosition + 1)

    this.setState({ text: updatedText })
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
    const tx = window.translate

    return (
      <ComposerWrapper>
        <AttachmentButtonWrapper>
          <Button minimal icon='paperclip' onClick={this.addFilename.bind(this)} />
        </AttachmentButtonWrapper>
        <AttachmentButtonWrapper ref={this.pickerButtonRef}>
          <IconButton onMouseOver={this.showEmojiPicker.bind(this, true)}>
            <IconButtonSpan />
          </IconButton>
        </AttachmentButtonWrapper>
        { this.state.showEmojiPicker &&
          <EmojiPickerWrapper ref={this.pickerRef}>
            <Picker
              title='Pick your emoji…'
              emoji='point_up'
              style={{ width: '100%', height: '100%' }}
              native
              color={StyleVariables.colors.deltaPrimaryBg}
              onSelect={this.onEmojiSelect}
            />
          </EmojiPickerWrapper>
        }
        <MessageInput
          ref={this.textareaRef}
          intent={this.state.error ? 'danger' : 'none'}
          large
          rows='1'
          value={this.state.text}
          onKeyDown={this.onKeyDown.bind(this)}
          onChange={this.handleChange}
          placeholder={tx('write_message_desktop')}
        />
        <SendButtonCircleWrapper onClick={this.sendMessage}>
          <SendButton />
        </SendButtonCircleWrapper>
      </ComposerWrapper>
    )
  }
}

module.exports = Composer
