const React = require('react')

const { Button } = require('@blueprintjs/core')
const { remote } = require('electron')
const StyleVariables = require('./style-variables')
const styled = require('styled-components').default

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

const MessageInput = styled.textarea`
  float: left;
  width: calc(100% - 100px);
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
  width: 33px;
  height: 33px;
  float: right;
  margin-top: 2px;
  margin-right: 5px;
  background-color: ${StyleVariables.colors.deltaPrimaryBg};
  border-radius: 180px;
`

const SendButton = styled.button`
  height: 25px;
  width: 25px;
  margin-top: 6px;
  margin-left: 8px;
  padding-left: 16px;
  background-image: url(../images/send-button.png);
  background-color: transparent;
  background-repeat: no-repeat;
  background-position: 0px 0px;
  border: none;
  cursor: pointer;
  vertical-align: middle;
  background-size: contain;
`

class Composer extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      filename: null,
      text: '',
      error: false
    }
    this.minimumHeight = 48
    this.defaultHeight = 17 + this.minimumHeight
    this.clearInput = this.clearInput.bind(this)
    this.handleChange = this.handleChange.bind(this)
    this.sendMessage = this.sendMessage.bind(this)
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
  }

  clearInput () {
    this.setState({ text: '', filename: null })
  }

  handleChange (e) {
    this.setState({ text: e.target.value, error: false })
  }

  focusInputMessage () {
    let el = document.querySelector(`.${ComposerWrapper.styledComponentId} input`)
    if (!el) return console.log(`Didn't find .ComposerWrapper input element`)
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

  render () {
    const tx = window.translate

    return (
      <ComposerWrapper>
        <AttachmentButtonWrapper>
          <Button minimal icon='paperclip' onClick={this.addFilename.bind(this)} />
        </AttachmentButtonWrapper>
        <MessageInput
          intent={this.state.error ? 'danger' : 'none'}
          large
          rows='1'
          value={this.state.text}
          onKeyDown={this.onKeyDown.bind(this)}
          aria-label={tx('writeMessageAriaLabel')}
          onChange={this.handleChange}
          placeholder={tx('writeMessage')}
        />
        <SendButtonCircleWrapper>
          <SendButton onClick={this.sendMessage} />
        </SendButtonCircleWrapper>
      </ComposerWrapper>
    )
  }
}

module.exports = Composer
