const React = require('react')

class WriteMessage extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      value: ''
    }
    this.minimumHeight = 48
    this.defaultHeight = 17 + this.minimumHeight
    this.clearInput = this.clearInput.bind(this)
		this.focusInput = this.focusInput.bind(this)
    this.resizeTextInput = this.resizeTextInput.bind(this)
    this.handleChange = this.handleChange.bind(this)
  }

  resizeTextInput () {
    this.textInput.style.height = '10px'
    this.textInput.style.height = (this.textInput.scrollHeight) + 'px'
  }

  componentDidMount () {
    this.resizeTextInput()
  }

  onKeyDown (e) {
    if (e.keyCode === 13 && e.shiftKey) {
      this.setState({ value: this.state.value + '\n' })
      e.preventDefault()
      e.stopPropagation()
    } else if (e.keyCode === 13 && !e.shiftKey) {
      this.props.onSubmit(this.state.value)
      this.clearInput()
      e.preventDefault()
      e.stopPropagation()
    }
  }

  clearInput () {
    this.setState({ value: '' })
  }

  handleChange (e) {
    this.setState({ value: e.target.value })
  }

  focusInput () {
    this.textInput.focus()
  }

  render () {
    return (
      <div className={'composerContainer'} onClick={this.focusInput}>
        <div className={'composer'}>
          <div className={'composer__input'}>
            <textarea
              id='message-bar'
              onChange={this.handleChange}
              value={this.state.value}
              name='message'
              ref={(input) => { this.textInput = input }}
              onKeyDown={this.onKeyDown.bind(this)}
              onKeyUp={(e) => this.resizeTextInput()}
              aria-label='Type a message and press enter'
              placeholder='Write a message'
						/>
          </div>
        </div>
      </div>
    )
  }
}

module.exports = WriteMessage
