const React = require('react')
const { ipcRenderer } = require('electron')

const {
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
    this.props.onSubmit(this.state.credentials)
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
    const { addrDisabled, loading } = this.props

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

    return (
      <form onSubmit={this.handleSubmit}>
        <FormGroup label={tx('login.email')} placeholder='E-Mail Address' labelFor='email' labelInfo={`(${tx('login.required')})`}>
          <InputGroup
            id='addr'
            disabled={addrDisabled}
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
        {React.Children.map(this.props.children, (child) => {
          var props = {}
          if (child.props.type === 'submit') {
            props.disabled = loading || (!addr || !mailPw)
          }
          if (child.props.type === 'cancel') {
            props.onClick = this.cancelClick.bind(this)
            if (!loading) return
          }
          return React.cloneElement(child, props)
        })}

      </form>
    )
  }
}

module.exports = Login
