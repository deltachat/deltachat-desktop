const React = require('react')
const { ipcRenderer } = require('electron')
const styled = require('styled-components').default

const {
  Alignment,
  Navbar,
  NavbarGroup,
  NavbarHeading,
  Button,
  InputGroup,
  FormGroup,
  Collapse,
  Intent,
  Callout
} = require('@blueprintjs/core')

const ClickableLink = require('./helpers/ClickableLink')
const NavbarWrapper = require('./NavbarWrapper')

const LoginWrapper = styled.div`
  .window {
    height: auto;
  }
`

class Login extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      credentials: this._defaultCredentials(),
      ui: {
        showAdvanced: false,
        showPasswordMail: false,
        showPasswordSend: false
      }
    }

    this.handleCredentialsChange = this.handleCredentialsChange.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
    this.renderPasswordInput = this.renderPasswordInput.bind(this)
  }

  _defaultCredentials () {
    return {
      addr: process.env.DC_ADDR ? process.env.DC_ADDR : '',
      imapFolder: '',
      mailUser: '',
      mailPw: process.env.DC_MAIL_PW ? process.env.DC_MAIL_PW : '',
      mailServer: '',
      mailPort: '',
      mailSecurity: '',
      sendUser: '',
      sendPw: '',
      sendServer: '',
      sendPort: '',
      sendSecurity: ''
    }
  }

  handleCredentialsChange (event) {
    let stateCredentials = Object.assign(this.state.credentials, { [event.target.id]: event.target.value })
    this.setState(stateCredentials)
  }

  handleSubmit (event) {
    ipcRenderer.send('login', this.state.credentials)
    event.preventDefault()
  }

  handleUISwitchStateProperty (key) {
    let stateUi = Object.assign(this.state.ui, { [key]: !this.state.ui[key] })
    this.setState(stateUi)
  }

  cancelClick (event) {
    ipcRenderer.send('dispatch', 'logout')
    this.setState({ credentials: this._defaultCredentials() })
    event.preventDefault()
    event.stopPropagation()
  }

  onClickLogin (login) {
    ipcRenderer.send('login', { addr: login, mailPw: true })
  }

  renderPasswordInput (keyShowPassword, keyValue) {
    const tx = window.translate

    const lockButton = (
      <Button
        icon={this.state[keyShowPassword] ? 'unlock' : 'lock'}
        intent={Intent.WARNING}
        minimal
        onClick={this.handleUISwitchStateProperty.bind(this, keyShowPassword)}
      />
    )

    return (
      <InputGroup
        id={keyValue}
        leftIcon='lock'
        type={this.state.ui[keyShowPassword] ? 'text' : 'password'}
        value={this.state.credentials[keyValue]}
        onChange={this.handleCredentialsChange}
        placeholder={tx('login.enterPassword')}
        rightElement={lockButton}
      />
    )
  }

  render () {
    const { logins, deltachat } = this.props

    const {
      addr,
      imapFolder,
      mailUser,
      mailPw,
      mailServer,
      mailPort,
      mailSecurity,
      sendUser,
      sendServer,
      sendPort,
      sendSecurity
    } = this.state.credentials

    const { showAdvanced } = this.state.ui

    const tx = window.translate

    var loading = deltachat.configuring

    return (
      <LoginWrapper>
        <NavbarWrapper>
          <Navbar fixedToTop>
            <NavbarGroup align={Alignment.LEFT}>
              <NavbarHeading>{tx('login.welcome')}</NavbarHeading>
            </NavbarGroup>
          </Navbar>
        </NavbarWrapper>
        <div className='window'>
          <Callout intent='danger' title='Single folder incompatibility'>
            To improve the user experience with Delta Chat using multiple devices, we experimentally changed the behaviour of Delta Chat. Therefore, beginning with this release, we aren't compatible with the <b>old android client</b> which you can currently find in the f-droid store. Please use the <b>new development</b> version. You can find it <ClickableLink href='https://github.com/deltachat/deltachat-android-ii/releases'>here</ClickableLink>.
          </Callout>
          <ul>
            {logins.map((login) => <li key={login}>
              <Button onClick={this.onClickLogin.bind(this, login)}> {login}</Button>
            </li>
            )}
          </ul>
          <form onSubmit={this.handleSubmit}>
            <FormGroup label={tx('login.email')} placeholder='E-Mail Address' labelFor='email' labelInfo={`(${tx('login.required')})`}>
              <InputGroup
                id='addr'
                type='text'
                value={addr}
                leftIcon='envelope'
                onChange={this.handleCredentialsChange}
              />
            </FormGroup>
            <FormGroup label={tx('login.mailPw')} placeholder='Password' labelFor='mailPw' labelInfo={`(${tx('login.required')})`}>
              {this.renderPasswordInput('showPasswordMail', 'mailPw')}
            </FormGroup>
            <Button onClick={this.handleUISwitchStateProperty.bind(this, 'showAdvanced')}>{(showAdvanced ? '-' : '+') + ' ' + tx('login.advanced') }</Button>
            <Collapse isOpen={showAdvanced}>
              <h2>{tx('login.inbox')}</h2>
              <FormGroup label={tx('login.mailUser')} placeholder='IMAP-Loginname' labelFor='mailUser' labelInfo={`(${tx('login.automatic')})`}>
                <InputGroup
                  id='mailUser'
                  type='text'
                  value={mailUser}
                  leftIcon='envelope'
                  onChange={this.handleCredentialsChange}
                />
              </FormGroup>
              <FormGroup label={tx('login.mailServer')} placeholder='IMAP-Server' labelFor='mailServer' labelInfo={`(${tx('login.automatic')})`}>
                <InputGroup
                  id='mailServer'
                  type='text'
                  value={mailServer}
                  leftIcon='envelope'
                  onChange={this.handleCredentialsChange}
                />
              </FormGroup>
              <FormGroup label={tx('login.mailPort')} placeholder='IMAP-Port' labelFor='mailPort' labelInfo={`(${tx('login.automatic')})`}>
                <InputGroup
                  id='mailPort'
                  type='number'
                  min='0'
                  max='65535'
                  value={mailPort}
                  leftIcon='envelope'
                  onChange={this.handleCredentialsChange}
                />
              </FormGroup>
              <FormGroup label={tx('login.imapFolder')} placeholder='IMAP-Folder' labelFor='imapFolder' labelInfo={`(${tx('default')}: INBOX)`}>
                <InputGroup
                  id='imapFolder'
                  type='text'
                  value={imapFolder}
                  leftIcon='envelope'
                  onChange={this.handleCredentialsChange}
                />
              </FormGroup>
              <FormGroup label={tx('login.mailSecurity')} placeholder='Security' labelFor='mailSecurity' labelInfo={`(${tx('login.automatic')})`}>
                <div className='bp3-select .modifier'>
                  <select id='mailSecurity' value={mailSecurity} onChange={this.handleCredentialsChange}>
                    <option value=''>{tx('login.security.automatic')}</option>
                    <option value='ssl'>SSL/TLS</option>
                    <option value='starttls'>STARTTLS</option>
                    <option value='plain'>{tx('login.security.disable')}</option>
                  </select>
                </div>
              </FormGroup>
              <h2>{tx('login.outbox')}</h2>
              <FormGroup label={tx('login.sendUser')} placeholder='SMTP-Loginname' labelFor='sendUser' labelInfo={`(${tx('login.automatic')})`}>
                <InputGroup
                  id='sendUser'
                  type='text'
                  value={sendUser}
                  leftIcon='envelope'
                  onChange={this.handleCredentialsChange}
                />
              </FormGroup>
              <FormGroup label={tx('login.sendPw')} placeholder='SMTP-Password' labelFor='sendPw' labelInfo={`(${tx('login.automatic')})`}>
                {this.renderPasswordInput('showPasswordSend', 'sendPw')}
              </FormGroup>
              <FormGroup label={tx('login.sendServer')} placeholder='SMTP-Server' labelFor='sendServer' labelInfo={`(${tx('login.automatic')})`}>
                <InputGroup
                  id='sendServer'
                  type='text'
                  value={sendServer}
                  leftIcon='envelope'
                  onChange={this.handleCredentialsChange}
                />
              </FormGroup>
              <FormGroup label={tx('login.sendPort')} placeholder='SMTP-Port' labelFor='sendPort' labelInfo={`(${tx('login.automatic')})`}>
                <InputGroup
                  id='sendPort'
                  type='number'
                  min='0'
                  max='65535'
                  value={sendPort}
                  leftIcon='envelope'
                  onChange={this.handleCredentialsChange}
                />
              </FormGroup>
              <FormGroup label={tx('login.sendSecurity')} placeholder='Security' labelFor='sendSecurity' labelInfo={`(${tx('login.automatic')})`}>
                <div className='bp3-select .modifier'>
                  <select id='sendSecurity' value={sendSecurity} onChange={this.handleCredentialsChange}>
                    <option value=''>{tx('login.security.automatic')}</option>
                    <option value='ssl'>SSL/TLS</option>
                    <option value='starttls'>STARTTLS</option>
                    <option value='plain'>{tx('login.security.disable')}</option>
                  </select>
                </div>
              </FormGroup>
            </Collapse>
            <Button disabled={loading || (!addr || !mailPw)} type='submit' text={tx('login.button')} />
            {loading && <Button text={tx('login.cancel')} onClick={this.cancelClick.bind(this)} />}
          </form>
        </div>
      </LoginWrapper>
    )
  }
}

module.exports = Login
