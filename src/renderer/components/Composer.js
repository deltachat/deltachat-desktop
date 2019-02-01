const React = require('react')

const { Button } = require('@blueprintjs/core')
const { remote } = require('electron')
const StyleVariables = require('./style-variables')
const styled = require('styled-components').default
const log = require('../../logger').getLogger('renderer/composer')
const { Picker } = require('emoji-mart')

const ComposerWrapper = styled.div`
  background-color: ${StyleVariables.colors.deltaPrimaryFg};
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

const MessageInput = styled.textarea`
  float: left;
  width: calc(100% - 120px);
  resize: unset;
  padding: 0px;
  border-color: transparent;
  border-width: 0px;
  height: 100%;
  line-height: 24px;
  height: calc(100% - 16px);
  line-height: 24px;
  margin-top: 8px;
  margin-bottom: 8px;
  margin-left: 40px;
  overflow-y: hidden;

  &:focus {
    outline: none;
  }

  &.scroll {
    overflow-y: scroll;
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
  background-color: ${StyleVariables.colors.deltaPrimaryBg};
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
      text: '',
      error: false,
      showEmojiPicker: false

    }
    this.minimumHeight = 48

    this.setCursorPosition = false

    this.setComposerSize = this.props.setComposerSize

    this.defaultHeight = 17 + this.minimumHeight
    this.clearInput = this.clearInput.bind(this)
    this.handleChange = this.handleChange.bind(this)
    this.handleKeyUp = this.handleKeyUp.bind(this)
    this.sendMessage = this.sendMessage.bind(this)
    this.focusInputMessage = this.focusInputMessage.bind(this)
    this.onEmojiSelect = this.onEmojiSelect.bind(this)
    this.onMouseMove = this.onMouseMove.bind(this)
    this.insertStringAtCursorPosition = this.insertStringAtCursorPosition.bind(this)

    this.textareaRef = React.createRef()
    this.pickerRef = React.createRef()
    this.pickerButtonRef = React.createRef()
  }

  onKeyDown (e) {
    if (e.keyCode === 13 && e.shiftKey) {
      this.insertStringAtCursorPosition('\n')
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

  componentDidUpdate () {
    if (this.setCursorPosition) {
      this.textareaRef.current.selectionStart = this.setCursorPosition
      this.textareaRef.current.selectionEnd = this.setCursorPosition
      this.setCursorPosition = false
    }
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
    this.resizeComposer('')
  }

  handleChange (e) {
    this.setState({ text: e.target.value, error: false })
    this.resizeComposer(e.target.value)
  }

  handleKeyUp (e) {
    if (e.keyCode === 13 && e.shiftKey) {
      this.resizeComposer(e.target.value)
    }
  }

  resizeComposer (textareaValue) {
    let n = this.findLessThanFourNewLines(textareaValue, '\n') + 1
    this.setComposerSize(n * 24 + 16)
    if (n > 4) {
      this.textareaRef.current.classList.add('scroll')
    } else {
      this.textareaRef.current.classList.remove('scroll')
    }
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
    this.insertStringAtCursorPosition(emoji.native)
  }

  insertStringAtCursorPosition (str) {
    let textareaElem = this.textareaRef.current
    let { selectionStart, selectionEnd } = textareaElem
    let textValue = this.state.text

    let textBeforeCursor = textValue.slice(0, selectionStart)
    let textAfterCursor = textValue.slice(selectionEnd)

    let updatedText = textBeforeCursor + str + textAfterCursor

    this.setCursorPosition = textareaElem.selectionStart + str.length
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

  findLessThanFourNewLines (str, find) {
    if (!str) return 0

    var count = 0
    for (let i = 0; i < str.length && count < 4; ++i) {
      if (str.substring(i, i + find.length) === find) {
        count++
      }
    }
    return count
  }

  render () {
    const tx = window.translate

    return (
      <ComposerWrapper ref='ComposerWrapper'>
        <AttachmentButtonWrapper>
          <Button minimal icon='paperclip' onClick={this.addFilename.bind(this)} />
        </AttachmentButtonWrapper>
        <MessageInput
          ref={this.textareaRef}
          intent={this.state.error ? 'danger' : 'none'}
          large
          value={this.state.text}
          onKeyDown={this.onKeyDown.bind(this)}
          onChange={this.handleChange}
          onKeyUp={this.handleKeyUp}
          placeholder={tx('write_message_desktop')}
        />
        <EmojiButtonWrapper ref={this.pickerButtonRef}>
          <IconButton onMouseOver={this.showEmojiPicker.bind(this, true)}>
            <IconButtonSpan />
          </IconButton>
        </EmojiButtonWrapper>
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
        <SendButtonCircleWrapper onClick={this.sendMessage}>
          <SendButton />
        </SendButtonCircleWrapper>
      </ComposerWrapper>
    )
  }
}

module.exports = Composer
