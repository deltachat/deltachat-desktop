const React = require('react')

const { ControlGroup, Button, TextArea } = require('@blueprintjs/core')
const { remote } = require('electron')
const styled = require('styled-components').default

const ComposerWrapper = styled.div`
  height: 40px;

  .composer {
    position: fixed;
    bottom: 0px;
    width: 70%;
    background-color: #eeefef;
    padding: 4px 10px;
  }

  input:focus {
    outline: 0;
    -webkit-box-shadow: unset;
    box-shadow: 0 0 0 0 rgba(19, 124, 189, 0), 0 0 0 0 rgba(19, 124, 189, 0), inset 0 0 0 1px rgba(16, 22, 26, 0.15), inset 0 1px 1px rgba(16, 22, 26, 0.2);
  }

  .composer button {
    max-width: 100px;
  }

  .composer textarea {
    resize: unset;
    box-shadow: none;
    background-color: #eeefef;
    padding: 0px;


    &:focus {
      outline: none;
    }
  }
`

const AttachmentButtonWrapper = styled.div`
  flex: none !important;
  button {
    margin-right: 10px;
  }
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
        <ControlGroup className='composer' fill vertical={false}>
          <AttachmentButtonWrapper>
            <Button minimal icon='paperclip' onClick={this.addFilename.bind(this)} />
          </AttachmentButtonWrapper>
          <TextArea
            intent={this.state.error ? 'danger' : 'none'}
            large
            rows='1'
            value={this.state.text}
            onKeyDown={this.onKeyDown.bind(this)}
            aria-label={tx('writeMessageAriaLabel')}
            onChange={this.handleChange}
            placeholder={tx('writeMessage')}
          />
          <Button onClick={this.sendMessage}>{tx('send')}</Button>
        </ControlGroup>
      </ComposerWrapper>
    )
  }
}

module.exports = Composer
