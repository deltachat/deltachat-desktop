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
      mail_user: '',
      mail_pw: process.env.DC_MAIL_PW ? process.env.DC_MAIL_PW : '',
      mail_server: '',
      mail_port: '',
      mail_security: '',
      send_user: '',
      send_pw: '',
      send_server: '',
      send_port: '',
      send_security: ''
    }
  }

  handleCredentialsChange (event) {
    let stateCredentials = Object.assign(this.state.credentials, { [event.target.id]: event.target.value })
    this.setState(stateCredentials)
  }

  translateSecurityToServerFlags (mail_security, send_security) {
    let serverFlags = []
    if (mail_security) {
      let imapFlag
      if (mail_security === 'ssl') {
        imapFlag = C.DC_LP_IMAP_SOCKET_SSL
      } else if (mail_security === 'starttls') {
        imapFlag = C.DC_LP_IMAP_SOCKET_STARTTLS
      } else if (mail_security === 'plain') {
        imapFlag = C.DC_LP_SMTP_SOCKET_PLAIN
      }
      if (imapFlag) serverFlags.push(imapFlag)
    }
    if (send_security) {
      let smtpFlag
      if (mail_security === 'ssl') {
        smtpFlag = C.DC_LP_SMTP_SOCKET_SSL
      } else if (mail_security === 'starttls') {
        smtpFlag = C.DC_LP_SMTP_SOCKET_STARTTLS
      } else if (mail_security === 'plain') {
        smtpFlag = C.DC_MAX_GET_INFO_LEN
      }
      if (smtpFlag) serverFlags.push(smtpFlag)
    }
    return serverFlags.length > 0 ? serverFlags : null
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
    ipcRenderer.send('login', { addr: login, mail_pw: true })
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
      mail_user,
      mail_pw,
      mail_server,
      mail_port,
      mail_security,
      send_user,
      send_server,
      send_port,
      send_security
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
            <FormGroup label={tx('login.mailPw')} placeholder='Password' labelFor='mail_pw' labelInfo={`(${tx('login.required')})`}>
              {this.renderPasswordInput('showPasswordMail', 'mail_pw')}
            </FormGroup>
            <Button onClick={this.handleUISwitchStateProperty.bind(this, 'showAdvanced')}>{(showAdvanced ? '-' : '+') + ' ' + tx('login.advanced') }</Button>
            <Collapse isOpen={showAdvanced}>
              <h2>{tx('login.inbox')}</h2>
              <FormGroup label={tx('login.mailUser')} placeholder='IMAP-Loginname' labelFor='mail_user' labelInfo={`(${tx('login.automatic')})`}>
                <InputGroup
                  id='mail_user'
                  type='text'
                  value={mail_user}
                  leftIcon='envelope'
                  onChange={this.handleCredentialsChange}
                />
              </FormGroup>
              <FormGroup label={tx('login.mailServer')} placeholder='IMAP-Server' labelFor='mail_server' labelInfo={`(${tx('login.automatic')})`}>
                <InputGroup
                  id='mail_server'
                  type='text'
                  c={mail_server}
                  leftIcon='envelope'
                  onChange={this.handleCredentialsChange}
                />
              </FormGroup>
              <FormGroup label={tx('login.mailPort')} placeholder='IMAP-Port' labelFor='mail_port' labelInfo={`(${tx('login.automatic')})`}>
                <InputGroup
                  id='mail_port'
                  type='number'
                  min='0'
                  max='65535'
                  value={mail_port}
                  leftIcon='envelope'
                  onChange={this.handleCredentialsChange}
                />
              </FormGroup>
              <FormGroup label={tx('login.mailSecurity')} placeholder='Security' labelFor='mail_security' labelInfo={`(${tx('login.automatic')})`}>
                <div className='bp3-select .modifier'>
                  <select id='mail_security' value={mail_security} onChange={this.handleCredentialsChange}>
                    <option value=''>{tx('login.security.automatic')}</option>
                    <option value='ssl'>SSL/TLS</option>
                    <option value='starttls'>STARTTLS</option>
                    <option value='plain'>{tx('login.security.disable')}</option>
                  </select>
                </div>
              </FormGroup>
              <h2>{tx('login.outbox')}</h2>
              <FormGroup label={tx('login.sendUser')} placeholder='SMTP-Loginname' labelFor='send_user' labelInfo={`(${tx('login.automatic')})`}>
                <InputGroup
                  id='send_user'
                  type='text'
                  value={send_user}
                  leftIcon='envelope'
                  onChange={this.handleCredentialsChange}
                />
              </FormGroup>
              <FormGroup label={tx('login.sendPw')} placeholder='SMTP-Password' labelFor='send_pw' labelInfo={`(${tx('login.automatic')})`}>
                {this.renderPasswordInput('showPasswordSend', 'send_pw')}
              </FormGroup>
              <FormGroup label={tx('login.sendServer')} placeholder='SMTP-Server' labelFor='send_server' labelInfo={`(${tx('login.automatic')})`}>
                <InputGroup
                  id='send_server'
                  type='text'
                  value={send_server}
                  leftIcon='envelope'
                  onChange={this.handleCredentialsChange}
                />
              </FormGroup>
              <FormGroup label={tx('login.sendPort')} placeholder='SMTP-Port' labelFor='send_port' labelInfo={`(${tx('login.automatic')})`}>
                <InputGroup
                  id='send_port'
                  type='number'
                  min='0'
                  max='65535'
                  value={send_port}
                  leftIcon='envelope'
                  onChange={this.handleCredentialsChange}
                />
              </FormGroup>
              <FormGroup label={tx('login.sendSecurity')} placeholder='Security' labelFor='send_security' labelInfo={`(${tx('login.automatic')})`}>
                <div className='bp3-select .modifier'>
                  <select id='send_security' value={send_security} onChange={this.handleCredentialsChange}>
                    <option value=''>{tx('login.security.automatic')}</option>
                    <option value='ssl'>SSL/TLS</option>
                    <option value='starttls'>STARTTLS</option>
                    <option value='plain'>{tx('login.security.disable')}</option>
                  </select>
                </div>
              </FormGroup>
            </Collapse>
            <Button disabled={loading || (!addr || !mail_pw)} type='submit' text={tx('login.button')} />
            {loading && <Button text={tx('login.cancel')} onClick={this.cancelClick.bind(this)} />}
          </form>
        </div>
      </div>
    )
  }
}

module.exports = Login
