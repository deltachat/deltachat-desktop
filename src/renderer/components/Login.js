import React from 'react'
import { ipcRenderer } from 'electron'
import * as update from 'immutability-helper'
import {
  DeltaInput,
  DeltaPasswordInput,
  DeltaHeadline,
  DeltaText,
  DeltaSelect,
  AdvancedButton,
  AdvancedButtonIconClosed,
  AdvancedButtonIconOpen,
  ProgressBarWrapper
} from './Login-Styles'
import {
  Collapse,
  ProgressBar,
  Intent
} from '@blueprintjs/core'

export default class Login extends React.Component {
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
        [event.target.id]: { $set: event.target.value }
      }
    })
    this.setState(updatedState)
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
            {(showAdvanced ? <AdvancedButtonIconClosed /> : <AdvancedButtonIconOpen />)}
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
