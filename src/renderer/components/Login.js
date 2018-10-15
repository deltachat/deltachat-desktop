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
      email: process.env.DC_ADDR,
      password: process.env.DC_MAIL_PW
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

  cancelClick (event) {
    ipcRenderer.send('dispatch', 'logout')
    this.setState({ email: '', password: '' })
    event.preventDefault()
    event.stopPropagation()
  }

  onClickLogin (login) {
    ipcRenderer.send('login', { email: login, password: true })
  }

  render () {
    const { logins, deltachat } = this.props
    const { email, password } = this.state
    const tx = window.translate

    var loading = deltachat.configuring

    return (
      <div>
        <Navbar fixedToTop>
          <NavbarGroup align={Alignment.LEFT}>
            <NavbarHeading>{tx('login.welcome')}</NavbarHeading>
          </NavbarGroup>
        </Navbar>
        <div className='window'>
          <ul>
            {logins.map((login) => <li key={login}>
              <Button onClick={this.onClickLogin.bind(this, login)}> {login}</Button>
            </li>
            )}
          </ul>
          <form onSubmit={this.handleSubmit}>
            <FormGroup label={tx('login.email')} placeholder='E-Mail Address' labelFor='email' labelInfo={`(${tx('login.required')})`}>
              <InputGroup
                id='email'
                type='text'
                value={email}
                leftIcon='envelope'
                onChange={this.handleChange}
              />
            </FormGroup>
            <FormGroup label={tx('login.password')} placeholder='Password' labelFor='password' labelInfo={`(${tx('login.required')})`}>
              <InputGroup
                id='password'
                leftIcon='lock'
                type='password'
                value={password}
                onChange={this.handleChange}
              />
            </FormGroup>
            <Button disabled={loading || !(email && password)} type='submit' text={tx('login.button')} />
            {loading && <Button text={tx('login.cancel')} onClick={this.cancelClick.bind(this)} />}
          </form>
        </div>
      </div>
    )
  }
}

module.exports = Login
