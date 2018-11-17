const React = require('react')

const { ControlGroup, Button, InputGroup } = require('@blueprintjs/core')
const { remote } = require('electron')

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
    const addFilenameButton = (
      <Button minimal icon='paperclip' onClick={this.addFilename.bind(this)} />
    )

    return (
      <ControlGroup className='composer' fill vertical={false}>
        <InputGroup
          intent={this.state.error ? 'danger' : 'none'}
          large
          value={this.state.text}
          onKeyDown={this.onKeyDown.bind(this)}
          aria-label={tx('writeMessageAriaLabel')}
          onChange={this.handleChange}
          placeholder={tx('writeMessage')}
          rightElement={addFilenameButton}
        />
        <Button onClick={this.sendMessage}>{tx('send')}</Button>
      </ControlGroup>
    )
  }
}

module.exports = Composer
