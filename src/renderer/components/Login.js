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
  Collapse
} = require('@blueprintjs/core')

class Login extends React.Component {
  constructor (props) {
    super(props)
    this.state = this._defaultState(false)

    this.handleChange = this.handleChange.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
    this.handleShowAdvanced = this.handleShowAdvanced.bind(this)
  }

  _defaultState (showAdvanced) {
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
      sendSecurity: '',
      showAdvanced: showAdvanced
    }
  }

  handleChange (event) {
    var state = {}
    state[event.target.id] = event.target.value
    this.setState(state)
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
    var credentials = {
      addr: this.state.addr,
      mail_pw: this.state.mailPw,
      mail_user: this.state.mailUser,
      mail_server: this.state.mailServer,
      mail_port: this.state.mailPort,
      send_server: this.state.sendServer,
      send_user: this.state.sendUser,
      send_pw: this.state.sendPw,
      send_port: this.state.sendPort,
      server_flags: this.translateSecurityToServerFlags(
        this.state.mailSecurity,
        this.state.sendSecurity
      )
    }

    // Remove all properties where value is an empty string, gets us around
    // React not liking state properties where the value is null/undefined if
    // bound to an input value
    for (let key in credentials) {
      if (credentials[key] === '') delete credentials[key]
    }

    // TODO: Implement security
    ipcRenderer.send('login', credentials)
    event.preventDefault()
  }

  handleShowAdvanced () {
    this.setState({ showAdvanced: !this.state.showAdvanced })
  }

  cancelClick (event) {
    ipcRenderer.send('dispatch', 'logout')
    this.setState(this._defaultState(this.state.showAdvanced))
    event.preventDefault()
    event.stopPropagation()
  }

  onClickLogin (login) {
    ipcRenderer.send('login', { addr: login, mailPw: true })
  }

  render () {
    const { logins, deltachat } = this.props
    const { addr, mailUser, mailPw, mailServer, mailPort, mailSecurity, sendUser, sendPw, sendServer, sendPort, sendSecurity } = this.state
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
                onChange={this.handleChange}
              />
            </FormGroup>
            <FormGroup label={tx('login.mailPw')} placeholder='Password' labelFor='mailPw' labelInfo={`(${tx('login.required')})`}>
              <InputGroup
                id='mailPw'
                leftIcon='lock'
                type='mailPw'
                value={mailPw}
                onChange={this.handleChange}
              />
            </FormGroup>
            <Button onClick={this.handleShowAdvanced}>{(this.state.showAdvanced ? '-' : '+') + ' ' + tx('login.advanced') }</Button>
            <Collapse isOpen={this.state.showAdvanced}>
              <h2>{tx('login.inbox')}</h2>
              <FormGroup label={tx('login.mailUser')} placeholder='IMAP-Loginname' labelFor='mailUser' labelInfo={`(${tx('login.automatic')})`}>
                <InputGroup
                  id='mailUser'
                  type='text'
                  value={mailUser}
                  leftIcon='envelope'
                  onChange={this.handleChange}
                />
              </FormGroup>
              <FormGroup label={tx('login.mailServer')} placeholder='IMAP-Server' labelFor='mailServer' labelInfo={`(${tx('login.automatic')})`}>
                <InputGroup
                  id='mailServer'
                  type='text'
                  value={mailServer}
                  leftIcon='envelope'
                  onChange={this.handleChange}
                />
              </FormGroup>
              <FormGroup label={tx('login.mailPort')} placeholder='IMAP-Port' labelFor='mailPort' labelInfo={`(${tx('login.automatic')})`}>
                <InputGroup
                  id='mailPort'
                  type='text'
                  value={mailPort}
                  leftIcon='envelope'
                  onChange={this.handleChange}
                />
              </FormGroup>
              <FormGroup label={tx('login.mailSecurity')} placeholder='Security' labelFor='mailSecurity' labelInfo={`(${tx('login.automatic')})`}>
                <div className='bp3-select .modifier'>
                  <select id='mailSecurity' value={mailSecurity} onChange={this.handleChange}>
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
                  onChange={this.handleChange}
                />
              </FormGroup>
              <FormGroup label={tx('login.sendPw')} placeholder='SMTP-Password' labelFor='sendPw' labelInfo={`(${tx('login.automatic')})`}>
                <InputGroup
                  id='sendPw'
                  type='text'
                  value={sendPw}
                  leftIcon='envelope'
                  onChange={this.handleChange}
                />
              </FormGroup>
              <FormGroup label={tx('login.sendServer')} placeholder='SMTP-Server' labelFor='sendServer' labelInfo={`(${tx('login.automatic')})`}>
                <InputGroup
                  id='sendServer'
                  type='text'
                  value={sendServer}
                  leftIcon='envelope'
                  onChange={this.handleChange}
                />
              </FormGroup>
              <FormGroup label={tx('login.sendPort')} placeholder='SMTP-Port' labelFor='sendPort' labelInfo={`(${tx('login.automatic')})`}>
                <InputGroup
                  id='sendPort'
                  type='text'
                  value={sendPort}
                  leftIcon='envelope'
                  onChange={this.handleChange}
                />
              </FormGroup>
              <FormGroup label={tx('login.sendSecurity')} placeholder='Security' labelFor='sendSecurity' labelInfo={`(${tx('login.automatic')})`}>
                <div className='bp3-select .modifier'>
                  <select id='sendSecurity' value={sendSecurity} onChange={this.handleChange}>
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
