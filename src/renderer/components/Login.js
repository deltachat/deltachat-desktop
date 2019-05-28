const React = require('react')
const { useState } = React
const { ipcRenderer } = require('electron')
const styled = require('styled-components').default
const update = require('immutability-helper').default
const StyleVariables = require('./style-variables')

console.log(StyleVariables)

const {
  Button,
  Callout,
  InputGroup,
  FormGroup,
  Collapse,
  ProgressBar,
  Intent
} = require('@blueprintjs/core')

const AdvancedButton = styled.div`
  -webkit-appearance: button-bevel;
  background-color: transparent;
  color: ${StyleVariables.colors.deltaFocusBlue};;
  font-size: 16px;
  float: left;
  display: block;
  width: 100%;
  &:hover {
    cursor: pointer;
  }
  p {
    margin-left: 8px;
    display: -webkit-inline-box;
    position: relative;
    font-size: 18px;
    margin-bottom: 0px;
    bottom: 3px;
  }
`

const AdvancedButtonIconOpen = styled.div`
  width: 20px;
  height: 20px;
  -webkit-mask: url(../images/dc-cross.svg) no-repeat center;
  -webkit-mask-size: 100%;
  background-color: ${StyleVariables.colors.deltaFocusBlue};
  display: -webkit-inline-box;
`

const AdvancedButtonIconClosed = styled(AdvancedButtonIconOpen)`
  transform: rotate(45deg);
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
      color: ${StyleVariables.colors.deltaChatPrimaryFgLight};
      font-size: 17px;
      &:hover, &:focus {
        outline: unset;
        outline-offset: unset;
      }
    }
  }
  .bp3-form-group label.bp3-label {
    padding-left: 10px;
    color: ${StyleVariables.colors.deltaChatPrimaryFgLight};
    font-size: 16px; 
  }
`

const DeltaSelect = React.memo((props) => {
  return (
    <DeltaSelectWrapper>
      <FormGroup label={props.label}>

        <div className='bp3-select .modifier'>
          <select id={props.id} value={props.value} onChange={props.onChange}>
            {props.children}
          </select>
        </div>
      </FormGroup>
    </DeltaSelectWrapper>
  )
})

const DeltaInputWrapper = styled(DeltaFormGroup)`
  .bp3-input {
    padding: unset;
    border-radius: unset;
    -webkit-box-shadow: none;
    box-shadow: none;
    border-bottom: 2px solid;
    border-bottom-color: ${StyleVariables.colors.deltaChatPrimaryFgLight};
    font-size: 16px; 

    &:focus {
      border-bottom-color: ${StyleVariables.colors.deltaFocusBlue};
      color: ${StyleVariables.colors.deltaFocusBlue};
    }

    &:focus::placeholder {
      color: transparent;
    }
    &::placeholder {
      color: ${StyleVariables.colors.deltaChatPrimaryFgLight};
    }
  }

  .bp3-button.bp3-minimal.bp3-intent-warning, .bp3-button.bp3-minimal.bp3-intent-warning:hover {
    color: #62656a !important;
  }

  .bp3-button.bp3-minimal.bp3-intent-warning:hover {
    background-color: #d0d0d0 !important;
  }
`

const DeltaInput = React.memo((props) => {
  console.log('di', props)
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
          disabled={props.disabled}
        />
      </FormGroup>
    </DeltaInputWrapper>
  )
})

const DeltaPasswordInput = React.memo((props) => {
  const tx = window.translate

  const [showPassword, setShowPassword] = useState(false)

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
          rightElement={lockButton}
        />
      </FormGroup>
    </DeltaInputWrapper>
  )
})

const ProgressBarWrapper = styled.div`
margin-top: 20px
`

const DeltaText = styled.p`
  color: ${StyleVariables.colors.deltaChatPrimaryFgLight};
`

const DeltaHeadline = styled.p`
  color: ${StyleVariables.colors.deltaChatPrimaryFgLight};
  font-size: 18px;
  padding: 15px 0 3px;`

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
    let updatedState = update(this.state, {
      credentials: {
        [event.target.id]: {$set: event.target.value}
      }
    })
    console.log('handleCredentialsChange', updatedState)
    this.setState(updatedState)
  }

  handleSubmit (event) {
    console.log(event)
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

  renderLoginHeader (mode) {
    return mode === 'update' ? null : <DeltaText>{window.translate('login_instruction_desktop')}</DeltaText>
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
            key='addr'
            id='addr'
            placeholder={tx('email_address')}
            disabled={addrDisabled}
            value={addr}
            onChange={this.handleCredentialsChange}
          />
          
          <DeltaPasswordInput
            key='mailPw'
            id='mailPw'
            label={tx('password')}
            placeholder={tx('password')}
            password={mailPw}
            onChange={this.handleCredentialsChange}
          />
          
          <AdvancedButton onClick={this.handleUISwitchStateProperty.bind(this, 'showAdvanced')}>
            {(showAdvanced ? <AdvancedButtonIconClosed/> : <AdvancedButtonIconOpen/>) }
            <p>{tx('menu_advanced') }</p>
          </AdvancedButton>
          <Collapse isOpen={showAdvanced}>
            <DeltaHeadline>{tx('login_inbox')}</DeltaHeadline>

            <DeltaInput
              key='mailUser'
              id='mailUser'
              placeholder={tx('login_imap_login')}
              type='text'
              value={mailUser}
              onChange={this.handleCredentialsChange}
            />

            <DeltaInput
              key='mailServer'
              id='mailServer'
              placeholder={tx('login_imap_server')}
              type='text'
              value={mailServer}
              onChange={this.handleCredentialsChange}
            />
            <DeltaInput
              key='mailPort'
              id='mailPort'
              placeholder={tx('login_imap_port')}
              type='number'
              min='0'
              max='65535'
              value={mailPort}
              onChange={this.handleCredentialsChange}
            />

            <DeltaSelect
              id='mailSecurity'
              label={tx('login_imap_security')}
              value={mailSecurity}
              onChange={this.handleCredentialsChange}
            >
              <option value='automatic'>Automatic</option>
              <option value='ssl'>SSL/TLS</option>
              <option value='starttls'>SartTLS</option>
              <option value='plain'>{tx('off')}</option>
            </DeltaSelect>

            <DeltaHeadline>{tx('login_outbox')}</DeltaHeadline>
            <DeltaInput
              key='sendUser'
              id='sendUser'
              placeholder={tx('login_smtp_login')}
              value={sendUser}
              onChange={this.handleCredentialsChange}
            />
            <DeltaPasswordInput
              key='sendPw'
              id='sendPw'
              placeholder={tx('login_smtp_password')}
              password={sendPw}
              onChange={this.handleCredentialsChange}
            />
            <DeltaInput
              key='sendServer'
              id='sendServer'
              placeholder={tx('login_smtp_server')}
              type='text'
              value={sendServer}
              onChange={this.handleCredentialsChange}
            />
            <DeltaInput
              key='sendPort'
              id='sendPort'
              placeholder={tx('login_smtp_port')}
              type='number'
              min='0'
              max='65535'
              value={sendPort}
              onChange={this.handleCredentialsChange}
            />
            <DeltaSelect
              id='sendSecurity'
              label={tx('login_smtp_security')}
              value={sendSecurity}
              onChange={this.handleCredentialsChange}
            >
              <option value='automatic'>Automatic</option>
              <option value='ssl'>SSL/TLS</option>
              <option value='starttls'>STARTTLS</option>
              <option value='plain'>{tx('off')}</option>
            </DeltaSelect>
          </Collapse>
          <br />
          <DeltaText>{tx('login_subheader')}</DeltaText>
          {
            loading &&
            <ProgressBarWrapper>
              <ProgressBar
                value={this.state.progress / 1000}
                intent={Intent.SUCCESS}
              />
            </ProgressBarWrapper>
          }
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
