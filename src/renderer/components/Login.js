const React = require('react')
const { ipcRenderer } = require('electron')

const {
  Alignment,
  Navbar,
  NavbarGroup,
  NavbarHeading,
  Button,
  InputGroup,
  FormGroup,
  Collapse
} = require('@blueprintjs/core')

class Login extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      email: process.env.DC_ADDR,
      password: process.env.DC_MAIL_PW,
      showAdvanced: false,
      imapLogin: null,
      imapServer: null,
      imapPort: null,
      imapSecurity: null,
      smtpLogin: null,
      smtpPassword: null,
      smtpServer: null,
      smtpPort: null,
      smtpSecurity: null,
    }

    this.handleChange = this.handleChange.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
    this.handleShowAdvanced = this.handleShowAdvanced.bind(this)
  }

  handleChange (event) {
    var state = {}
    state[event.target.id] = event.target.value
    this.setState(state)
  }

  handleSubmit (event) {
    var credentials = {
      addr: this.state.email,
      mail_pw: this.state.password,
      mail_user: this.state.imapLogin,
      mail_server: this.state.imapServer,
      mail_port: this.state.imapPort,
      send_server: this.state.smtpServer,
      send_user: this.state.smtpLogin,
      send_pw: this.state.smtpPassword,
      send_port: this.state.smtpPort
    }
    ipcRenderer.send('login', credentials)
    event.preventDefault()
  }

  handleShowAdvanced() {
    this.setState({showAdvanced: !this.state.showAdvanced})
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
    console.log(this.state)
    const { logins, deltachat } = this.props
    const { email, password, imapLogin, imapServer, imapPort, imapSecurity, smtpLogin, smtpServer, smtpPort, smtpSecurity } = this.state
    const tx = window.translate

    var loading = deltachat.configuring

    return (
      <div className='Login'>
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
            <Button onClick={this.handleShowAdvanced}>{(this.state.showAdvanced ? '-' : '+') + ' Advanced' }</Button>
            <Collapse isOpen={this.state.showAdvanced}>
              <h2>{tx('login.inbox')}</h2>
              <FormGroup label={tx('login.imapLogin')} placeholder='IMAP-Loginname' labelFor='imapLogin' labelInfo={`(${tx('login.automatic')})`}>
                <InputGroup
                  id='imapLogin'
                  type='text'
                  value={imapLogin}
                  leftIcon='envelope'
                  onChange={this.handleChange}
                />
              </FormGroup>
              <FormGroup label={tx('login.imapServer')} placeholder='IMAP-Server' labelFor='imapServer' labelInfo={`(${tx('login.automatic')})`}>
                <InputGroup
                  id='imapServer'
                  type='text'
                  value={imapLogin}
                  leftIcon='envelope'
                  onChange={this.handleChange}
                />
              </FormGroup>
              <FormGroup label={tx('login.imapPort')} placeholder='IMAP-Port' labelFor='imapPort' labelInfo={`(${tx('login.automatic')})`}>
                <InputGroup
                  id='imapPort'
                  type='text'
                  value={imapPort}
                  leftIcon='envelope'
                  onChange={this.handleChange}
                />
              </FormGroup>
              <FormGroup label={tx('login.imapLogin')} placeholder='IMAP-Loginname' labelFor='imapLogin' labelInfo={`(${tx('login.automatic')})`}>
                <InputGroup
                  id='imap-login'
                  type='text'
                  value={imapLogin}
                  leftIcon='envelope'
                  onChange={this.handleChange}
                />
              </FormGroup>
              <FormGroup label={tx('login.imapSecurity')} placeholder='Security' labelFor='imapSecurity' labelInfo={`(${tx('login.automatic')})`}>
                <div class="bp3-select .modifier">
                  <select id="imapSecurity" value={this.state.imapSecurity} onChange={this.handleChange}>
                    <option value="">{tx('login.security.automatic')}</option>
                    <option value="ssl">SSL/TLS</option>
                    <option value="starttls">STARTTLS</option>
                    <option value="plain">{tx('login.security.disable')}</option>
                  </select>
                </div>
              </FormGroup>
              <h2>{tx('login.outbox')}</h2>
              <FormGroup label={tx('login.smtpLogin')} placeholder='IMAP-Loginname' labelFor='smtpLogin' labelInfo={`(${tx('login.automatic')})`}>
                <InputGroup
                  id='smtpLogin'
                  type='text'
                  value={smtpLogin}
                  leftIcon='envelope'
                  onChange={this.handleChange}
                />
              </FormGroup>
              <FormGroup label={tx('login.smtpServer')} placeholder='IMAP-Server' labelFor='smtpServer' labelInfo={`(${tx('login.automatic')})`}>
                <InputGroup
                  id='smtpServer'
                  type='text'
                  value={smtpLogin}
                  leftIcon='envelope'
                  onChange={this.handleChange}
                />
              </FormGroup>
              <FormGroup label={tx('login.smtpPort')} placeholder='IMAP-Port' labelFor='smtpPort' labelInfo={`(${tx('login.automatic')})`}>
                <InputGroup
                  id='smtpPort'
                  type='text'
                  value={smtpPort}
                  leftIcon='envelope'
                  onChange={this.handleChange}
                />
              </FormGroup>
              <FormGroup label={tx('login.smtpLogin')} placeholder='IMAP-Loginname' labelFor='smtpLogin' labelInfo={`(${tx('login.automatic')})`}>
                <InputGroup
                  id='smtp-login'
                  type='text'
                  value={smtpLogin}
                  leftIcon='envelope'
                  onChange={this.handleChange}
                />
              </FormGroup>
              <FormGroup label={tx('login.smtpSecurity')} placeholder='Security' labelFor='smtpSecurity' labelInfo={`(${tx('login.automatic')})`}>
                <div class="bp3-select .modifier">
                  <select id="smtpSecurity" value={this.state.smtpSecurity} onChange={this.handleChange}>
                    <option value="">{tx('login.security.automatic')}</option>
                    <option value="ssl">SSL/TLS</option>
                    <option value="starttls">STARTTLS</option>
                    <option value="plain">{tx('login.security.disable')}</option>
                  </select>
                </div>
              </FormGroup>
            </Collapse>
            <Button disabled={loading || !(email && password)} type='submit' text={tx('login.button')} />
            {loading && <Button text={tx('login.cancel')} onClick={this.cancelClick.bind(this)} />}
          </form>
        </div>
      </div>
    )
  }
}




module.exports = Login
