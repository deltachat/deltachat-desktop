const React = require('react')
const { ipcRenderer } = require('electron')

const {
  Button,
  Callout,
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
    /* *CONFIG* */
    return {
      addr: process.env.DC_ADDR || this.props.addr || '',
      mailUser: this.props.mailUser || '',
      mailPw: process.env.DC_MAIL_PW || this.props.mailPw || '',
      mailServer: this.props.mailServer || '',
      mailPort: this.props.mailPort || '',
      mailSecurity: this.props.mailSecurity || '',
      sendUser: this.props.sendUser || '',
      sendPw: this.props.sendPw || '',
      sendServer: this.props.sendServer || '',
      sendPort: this.props.sendPort || '',
      sendSecurity: this.props.sendSecurity || ''
    }
  }

  handleCredentialsChange (event) {
    let stateCredentials = Object.assign(this.state.credentials, { [event.target.id]: event.target.value })
    this.setState(stateCredentials)
  }

  handleSubmit (event) {
    let config = this.state.credentials
    if (!this.state.ui.showAdvanced) {
      // ignore advanced settings
      config = { mailPw: config.mailPw, addr: config.addr }
    }
    this.props.onSubmit(config)
    event.preventDefault()
  }

  handleUISwitchStateProperty (key) {
    let stateUi = Object.assign(this.state.ui, { [key]: !this.state.ui[key] })
    this.setState(stateUi)
  }

  cancelClick (event) {
    ipcRenderer.send('logout')
    this.setState({ credentials: this._defaultCredentials() })
    event.preventDefault()
    event.stopPropagation()
  }

  renderPasswordInput (keyShowPassword, keyValue) {
    const tx = window.translate

    const lockButton = (
      <Button
        icon={this.state[keyShowPassword] ? 'eye-open' : 'eye-off'}
        title={this.state[keyShowPassword] ? tx('hide_password') : tx('show_password')}
        intent={Intent.WARNING}
        minimal
        onClick={this.handleUISwitchStateProperty.bind(this, keyShowPassword)}
      />
    )

    return (
      <InputGroup
        id={keyValue}
        type={this.state.ui[keyShowPassword] ? 'text' : 'password'}
        value={this.state.credentials[keyValue]}
        onChange={this.handleCredentialsChange}
        placeholder={tx('password')}
        rightElement={this.state.credentials[keyValue].length > 0 ? lockButton : null}
      />
    )
  }

  renderLoginHeader (mode) {
    return mode === 'update' ? null : <Callout>{window.translate('login_instruction_desktop')}</Callout>
  }

  render () {
    const { addrDisabled, loading, mode } = this.props

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
      sendSecurity,
      sendPw
    } = this.state.credentials

    const { showAdvanced } = this.state.ui

    const tx = window.translate

    return (
      <React.Fragment>
        {this.renderLoginHeader(mode)}
        <form onSubmit={this.handleSubmit}>
          <FormGroup label={tx('email_address')} placeholder={tx('email_address')} labelFor='email'>
            <InputGroup
              id='addr'
              disabled={addrDisabled}
              type='text'
              value={addr}
              onChange={this.handleCredentialsChange}
            />
          </FormGroup>
          <FormGroup label={tx('password')} placeholder={tx('password')} labelFor='mailPw'>
            {this.renderPasswordInput('showPasswordMail', 'mailPw')}
          </FormGroup>
          <Button onClick={this.handleUISwitchStateProperty.bind(this, 'showAdvanced')}>
            {(showAdvanced ? '-' : '+') + ' ' + tx('menu_advanced') }
          </Button>
          <Collapse isOpen={showAdvanced}>
            <h2>{tx('login_inbox')}</h2>
            <p>{tx('login_subheader')}</p>
            <FormGroup
              label={tx('login_imap_login')}
              placeholder={tx('login_imap_login')}
              labelFor='mailUser'>
              <InputGroup
                id='mailUser'
                type='text'
                value={mailUser}
                onChange={this.handleCredentialsChange}
              />
            </FormGroup>
            <FormGroup
              label={tx('login_imap_server')}
              placeholder={tx('login_imap_server')}
              labelFor='mailServer'>
              <InputGroup
                id='mailServer'
                type='text'
                value={mailServer}
                onChange={this.handleCredentialsChange}
              />
            </FormGroup>
            <FormGroup
              label={tx('login_imap_port')}
              placeholder={tx('login_imap_port')}
              labelFor='mailPort'>
              <InputGroup
                id='mailPort'
                type='number'
                min='0'
                max='65535'
                value={mailPort}
                placeholder={tx('def')}
                onChange={this.handleCredentialsChange}
              />
            </FormGroup>
            <FormGroup label={tx('login_imap_security')} placeholder={tx('login_imap_security')}
              labelFor='mailSecurity'>
              <div className='bp3-select .modifier'>
                <select id='mailSecurity' value={mailSecurity} onChange={this.handleCredentialsChange}>
                  <option value='ssl'>SSL/TLS</option>
                  <option value='starttls'>STARTTLS</option>
                </select>
              </div>
            </FormGroup>
            <h2>{tx('login_outbox')}</h2>
            <FormGroup
              label={tx('login_smtp_login')}
              placeholder={tx('login_smtp_login')}
              labelFor='sendUser'>
              <InputGroup
                id='sendUser'
                type='text'
                value={sendUser}
                onChange={this.handleCredentialsChange}
              />
            </FormGroup>
            <FormGroup
              label={tx('login_smtp_password')}
              placeholder={tx('login_smtp_password')}
              labelFor='sendPw'>
              {this.renderPasswordInput('showPasswordSend', 'sendPw')}
            </FormGroup>
            <FormGroup
              label={tx('login_smtp_server')}
              placeholder={tx('login_smtp_server')}
              labelFor='sendServer'>
              <InputGroup
                id='sendServer'
                type='text'
                value={sendServer}
                onChange={this.handleCredentialsChange}
              />
            </FormGroup>
            <FormGroup
              label={tx('login_smtp_port')}
              placeholder={tx('login_smtp_port')}
              labelFor='sendPort'>
              <InputGroup
                id='sendPort'
                type='number'
                min='0'
                max='65535'
                value={sendPort}
                placeholder={tx('def')}
                onChange={this.handleCredentialsChange}
              />
            </FormGroup>
            <FormGroup
              label={tx('login_smtp_security')}
              placeholder={tx('login_smtp_security')}
              labelFor='sendSecurity'>
              <div className='bp3-select .modifier'>
                <select id='sendSecurity' value={sendSecurity} onChange={this.handleCredentialsChange}>
                  <option value='ssl'>SSL/TLS</option>
                  <option value='starttls'>STARTTLS</option>
                </select>
              </div>
            </FormGroup>
          </Collapse>
          <br />
          {React.Children.map(this.props.children, (child) => {
            var props = {}
            if (child.props.type === 'submit') {
              props.disabled = loading || (!addr || !mailPw) || (showAdvanced && !sendPw)
            }
            if (child.props.type === 'cancel') {
              props.onClick = this.cancelClick.bind(this)
              if (!loading) return
            }
            return React.cloneElement(child, props)
          })}

        </form>
      </React.Fragment>
    )
  }
}

module.exports = Login
