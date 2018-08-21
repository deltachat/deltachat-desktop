const React = require('react')

const {ipcRenderer} = require('electron')

class Login extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      email: this.props.credentials.email || '',
      password: this.props.credentials.password || '***'
    }

    this.handleChange = this.handleChange.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
  }

  handleChange (event) {
    var state = {}
    state[event.target.id] = event.target.value
    this.setState(state)
  }

  handleSubmit (event) {
    var credentials = {
      email: this.state.email,
      password: this.state.password
    }
    ipcRenderer.send('login', credentials)
    event.preventDefault()
  }

  render () {
    return (
      <form onSubmit={this.handleSubmit}>
        <input id='email' type='text' value={this.state.email} onChange={this.handleChange} />
        <input id='password' type='password' value={this.state.password} onChange={this.handleChange} />
        <input type='submit' value='Submit' />
      </form>
    )
  }
}

module.exports = Login
