const React = require('react')
const { ipcRenderer } = require('electron')
const C = require('deltachat-node/constants')

const {
  Alignment,
  Navbar,
  NavbarGroup,
  NavbarHeading,
  Button,
  InputGroup,
  FormGroup,
  Collapse,
  Intent
} = require('@blueprintjs/core')

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
    console.log('handleCredentialsChange', event.target.id, event.target.value)
    this.setState({ credentials: { [event.target.id]: event.target.value } })
  }

  translateSecurityToServerFlags (mailSecurity, sendSecurity) {
    let serverFlags = []
    if (mailSecurity) {
      let imapFlag
      if (mailSecurity === 'ssl') {
        imapFlag = C.DC_LP_IMAP_SOCKET_SSL
      } else if (mailSecurity === 'starttls') {
        imapFlag = C.DC_LP_IMAP_SOCKET_STARTTLS
      } else if (mailSecurity === 'plain') {
        imapFlag = C.DC_LP_SMTP_SOCKET_PLAIN
      }
      if (imapFlag) serverFlags.push(imapFlag)
    }
    if (sendSecurity) {
      let smtpFlag
      if (mailSecurity === 'ssl') {
        smtpFlag = C.DC_LP_SMTP_SOCKET_SSL
      } else if (mailSecurity === 'starttls') {
        smtpFlag = C.DC_LP_SMTP_SOCKET_STARTTLS
      } else if (mailSecurity === 'plain') {
        smtpFlag = C.DC_MAX_GET_INFO_LEN
      }
      if (smtpFlag) serverFlags.push(smtpFlag)
    }
    return serverFlags.length > 0 ? serverFlags : null
  }

  handleSubmit (event) {
    // TODO: Implement security
    ipcRenderer.send('login', this.state.credentials)
    event.preventDefault()
  }

  handleUISwitchStateProperty (key) {
    console.log('a', this.state.ui[key])
    this.setState({ ui: { [key]: !this.state.ui[key] } })
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

    let lockButton = (
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
        type={this.state[keyShowPassword] ? 'text' : 'password'}
        value={this.state[keyValue]}
        onChange={this.handleCredentialsChange}
        placeholder={tx('login.enterPassword')}
        rightElement={lockButton}
      />
    )
  }

  render () {
    const { logins, deltachat } = this.props

    console.log(this.state)
    const {
      addr,
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
                  type='text'
                  value={mailPort}
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
                  type='text'
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
      </div>
    )
  }
}

module.exports = Login
