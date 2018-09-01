const React = require('react')

const { ControlGroup, Button, InputGroup } = require('@blueprintjs/core')

class Composer extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      value: '',
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
      this.setState({ value: this.state.value + '\n' })
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
    if (!this.state.value) return this.handleError()
    this.props.onSubmit(this.state.value)
    this.clearInput()
  }

  clearInput () {
    this.setState({ value: '' })
  }

  handleChange (e) {
    this.setState({ value: e.target.value, error: false })
  }

  addAttachment () {
    console.log('adding attachment')
  }

  render () {
    const addAttachmentButton = (
      <Button minimal icon='paperclip' onClick={this.addAttachment.bind(this)} />
    )
    return (
      <ControlGroup className='composer' fill vertical={false}>
        <InputGroup
          intent={this.state.error ? 'danger' : 'none'}
          large
          value={this.state.value}
          onKeyDown={this.onKeyDown.bind(this)}
          aria-label='Type a message and press enter'
          onChange={this.handleChange}
          placeholder='Write a message'
          rightElement={addAttachmentButton}
        />
        <Button onClick={this.sendMessage}>Send</Button>
      </ControlGroup>
    )
  }
}

module.exports = Composer
