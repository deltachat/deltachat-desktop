const React = require('react')
const { ipcRenderer } = require('electron')

const {
  Alignment,
  Navbar,
  NavbarGroup,
  NavbarHeading,
  Button,
  InputGroup,
  FormGroup
} = require('@blueprintjs/core')

class Login extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      email: this.props.credentials.email || process.env.DC_ADDR,
      password: this.props.credentials.password || process.env.DC_MAIL_PW
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
    ipcRenderer.send('init', credentials)
    event.preventDefault()
  }

  cancelClick (event) {
    ipcRenderer.send('dispatch', 'logout')
    this.setState({ email: '', password: '' })
    event.stopPropagation()
  }

  render () {
    const { deltachat } = this.props
    const tx = window.translate

    var loading = deltachat.configuring

    return (
      <div>
        <Navbar fixedToTop>
          <NavbarGroup align={Alignment.LEFT}>
            <NavbarHeading>Welcome to Delta.Chat</NavbarHeading>
          </NavbarGroup>
        </Navbar>
        <div className='window'>
          <form onSubmit={this.handleSubmit}>
            <FormGroup label='E-Mail Address' placeholder='E-Mail Address' labelFor='email' labelInfo='(required)'>
              <InputGroup
                id='email'
                type='text'
                value={this.state.email}
                leftIcon='envelope'
                onChange={this.handleChange}
              />
            </FormGroup>
            <FormGroup label='Password' placeholder='Password' labelFor='password'>
              <InputGroup
                id='password'
                leftIcon='lock'
                type='password'
                value={this.state.password}
                onChange={this.handleChange}
              />
            </FormGroup>
            <Button disabled={loading} type='submit' text={tx('login.button')} />
            <Button text={tx('login.cancel')} onClick={this.cancelClick.bind(this)} />
          </form>
        </div>
      </div>
    )
  }
}

module.exports = Login
