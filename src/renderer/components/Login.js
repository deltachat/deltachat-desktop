const React = require('react')
const { useState } = React
const { ipcRenderer } = require('electron')
const styled = require('styled-components').default

const {
  Button,
  Callout,
  InputGroup,
  FormGroup,
  Collapse,
  ProgressBar,
  Intent
} = require('@blueprintjs/core')
const { Select } = require('@blueprintjs/select')

const AdvancedButton = styled.button`
  -webkit-appearance: button-bevel;
  background-color: transparent;`

const AdvancedButtonIconClosed = styled.div`
  &::after {
    content: '+';
  }
`

const AdvancedButtonIconOpen = styled.div`
  &::after {
    content: 'x';
  }
`

const DeltaFormGroup = styled.div`
  .bp3-form-content { 
    padding: 0px 10px 0px 10px;
  }
`

const DeltaSelectWrapper = styled(DeltaFormGroup)`
  .bp3-select::after {
    content:'>';
    font:11px "Consolas", monospace;
    transform:rotate(90deg);
  }
  .bp3-select {
    width: 100%;
    select {
     -webkit-box-shadow: none;
      box-shadow: none;
      background-image: none;
      background-color: transparent;
      width: 100%;
      &:hover {
        outline: none;
        outline-offset: none;
      }
    }
  }
`

const DeltaSelect = function(props) {
  return (
    <DeltaSelectWrapper>
      <div className='bp3-select .modifier'>
        <select id={props.id} value={props.value} onChange={props.onChange}>
          {props.children}
        </select>
      </div>
    </DeltaSelectWrapper>
  )
}

const DeltaInputWrapper = styled(DeltaFormGroup)`
  .bp3-input {
    padding: unset;
    border-radius: unset;
    -webkit-box-shadow: none;
    box-shadow: none;
    border-bottom: 1px solid;
  }
`

const DeltaInput = function(props) {
  return (
    <DeltaInputWrapper>
      <FormGroup>
        <InputGroup
          id={props.id}
          type={props.type}
          value={props.value}
          onChange={props.onChange}
          placeholder={props.placeholder}
          min={props.min}
          max={props.max}
        />
      </FormGroup>
    </DeltaInputWrapper>
  )
}

const DeltaPasswordInput = function(props) {
    const tx = window.translate

    const { showPassword, setShowPassword } = useState(false)

    const password = props.password || ''
    console.log('props:', props)

    const lockButton = (
      <Button
        icon={showPassword ? 'eye-open' : 'eye-off'}
        title={showPassword ? tx('hide_password') : tx('show_password')}
        intent={Intent.WARNING}
        minimal
        onClick={() => setShowPassword(!showPassword)}
      />
    )

    return (
      <DeltaInputWrapper>
        <FormGroup>
          <InputGroup
            id={props.id}
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={props.onChange}
            placeholder={props.placeholder}
            rightElement={password.length > 0 ? lockButton : null}
          />
        </FormGroup>
      </DeltaInputWrapper>
      )
}

const ProgressBarWrapper = styled.div`
margin-top: 20px
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
      },
      progress: 0
    }
    this._updateProgress = this._updateProgress.bind(this)
    this.handleCredentialsChange = this.handleCredentialsChange.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
    this.renderPasswordInput = this.renderPasswordInput.bind(this)
  }

  componentDidMount () {
    ipcRenderer.on('DC_EVENT_CONFIGURE_PROGRESS', this._updateProgress)
  }

  componentWillUnmount () {
    ipcRenderer.removeListener('DC_EVENT_CONFIGURE_PROGRESS', this._updateProgress)
  }

  _updateProgress (ev, progress) {
    this.setState({ progress })
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
      <DeltaInputWrapper>
        <FormGroup>
          <InputGroup
            id={keyValue}
            type={this.state.ui[keyShowPassword] ? 'text' : 'password'}
            value={this.state.credentials[keyValue]}
            onChange={this.handleCredentialsChange}
            placeholder={tx('password')}
            rightElement={this.state.credentials[keyValue].length > 0 ? lockButton : null}
          />
        </FormGroup>
      </DeltaInputWrapper>
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
    
          <DeltaInput
            placeholder={tx('email_address')}
            labelFor='email'
            id='addr'
            disabled={addrDisabled}
            type='text'
            value={addr}
            onChange={this.handleCredentialsChange}
          />
          
          <DeltaPasswordInput
            label={tx('password')}
            placeholder={tx('password')}
            password={this.state.credentials['mailPw']}
            onChange={this.handleCredentialsChange}
          />
          
          <AdvancedButton onClick={this.handleUISwitchStateProperty.bind(this, 'showAdvanced')}>
            {(showAdvanced ? <AdvancedButtonIconOpen/> : <AdvancedButtonIconClosed/>) }
            {tx('menu_advanced') }
          </AdvancedButton>
          <Collapse isOpen={showAdvanced}>
            <h2>{tx('login_inbox')}</h2>
            <p>{tx('login_subheader')}</p>
            <DeltaInput
              label={tx('login_imap_login')}
              placeholder={tx('login_imap_login')}
              labelFor='mailUser'>
              id='mailUser'
              type='text'
              value={mailUser}
              onChange={this.handleCredentialsChange}
            </DeltaInput>
            <DeltaInput
              placeholder={tx('login_imap_server')}
              labelFor='mailServer'>
              id='mailServer'
              type='text'
              value={mailServer}
              onChange={this.handleCredentialsChange}
            </DeltaInput>
            <DeltaInput
              placeholder={tx('login_imap_port')}
              labelFor='mailPort'>
              id='mailPort'
              type='number'
              min='0'
              max='65535'
              value={mailPort}
              placeholder={tx('def')}
              onChange={this.handleCredentialsChange}
            </DeltaInput>
            <FormGroup label={tx('login_imap_security')} placeholder={tx('login_imap_security')}
              labelFor='mailSecurity'>
              <DeltaSelect id='mailSecurity' value={mailSecurity} onChange={this.handleCredentialsChange}>
                <option value='automatic'>Automatic</option>
                <option value='ssl'>SSL/TLS</option>
                <option value='starttls'>SartTLS</option>
                <option value='plain'>{tx('off')}</option>
              </DeltaSelect>
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
              <DeltaSelect id='sendSecurity' value={sendSecurity} onChange={this.handleCredentialsChange}>
                <option value='automatic'>Automatic</option>
                <option value='ssl'>SSL/TLS</option>
                <option value='starttls'>STARTTLS</option>
                <option value='plain'>{tx('off')}</option>
              </DeltaSelect>
            </FormGroup>
          </Collapse>
          {
            loading &&
            <ProgressBarWrapper>
              <ProgressBar
                value={this.state.progress / 1000}
                intent={Intent.SUCCESS}
              />
            </ProgressBarWrapper>
          }
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
