/* eslint-disable camelcase */

import React from 'react'
import { ipcRenderer } from 'electron'
import * as update from 'immutability-helper'
import {
  DeltaInput,
  DeltaPasswordInput,
  DeltaHeadline,
  DeltaText,
  DeltaSelect,
  DeltaProgressBar,
  AdvancedButton,
  AdvancedButtonIconClosed,
  AdvancedButtonIconOpen
} from './Login-Styles'
import {
  Collapse,
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
      progress: 0,
      dirty: false,
      disableSubmit: false
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
    return {
      addr: this.props.addr || '',
      mail_user: this.props.mail_user || '',
      mail_pw: this.props.mail_pw || '',
      mail_server: this.props.mail_server || '',
      mail_port: this.props.mail_port || '',
      mail_security: this.props.mail_security || '',
      send_user: this.props.send_user || '',
      send_pw: this.props.send_pw || '',
      send_server: this.props.send_server || '',
      send_port: this.props.send_port || '',
      send_security: this.props.send_security || ''
    }
  }

  handleCredentialsChange (event) {
    const { mode } = this.props
    const { id, value } = event.target
    const updatedState = update(this.state, {
      credentials: {
        [id]: { $set: value }
      }
    })
    let dirty = false
    if (mode === 'update') {
      dirty = Object.keys(updatedState.credentials).find(
        key => this.props[key] !== updatedState.credentials[key]
      ) !== undefined
    } else {
      dirty = Object.keys(updatedState.credentials).find(
        key => updatedState.credentials[key] !== ''
      ) !== undefined
    }
    updatedState.dirty = dirty
    updatedState.disableSubmit = false
    this.setState(updatedState)
  }

  handleSubmit (event) {
    const { mode } = this.props
    const credentials = this.state.credentials
    this.props.onSubmit(credentials)
    event.preventDefault()
    if (mode !== 'update') {
      this.setState({ disableSubmit: true })
    }
  }

  handleUISwitchStateProperty (key) {
    const stateUi = Object.assign(this.state.ui, { [key]: !this.state.ui[key] })
    this.setState(stateUi)
  }

  cancelClick (event) {
    const { mode } = this.props
    event.preventDefault()
    event.stopPropagation()
    this.setState({ disableSubmit: false })
    if (mode === 'update') {
      this.props.onCancel()
    } else {
      ipcRenderer.send('logout')
    }
  }

  renderLoginHeader (mode) {
    return mode === 'update' ? null : <DeltaText>{window.translate('login_explain')}</DeltaText>
  }

  render () {
    const { addrDisabled, loading, mode } = this.props
    const { disableSubmit } = this.state

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
      send_security,
      send_pw
    } = this.state.credentials

    const { showAdvanced } = this.state.ui

    const { dirty } = this.state

    const tx = window.translate

    return (
      <React.Fragment>
        {this.renderLoginHeader(mode)}
        <form onSubmit={this.handleSubmit} className={'login-form'}>

          <DeltaInput
            key='addr'
            id='addr'
            placeholder={tx('email_address')}
            disabled={addrDisabled}
            value={addr}
            onChange={this.handleCredentialsChange}
          />

          <DeltaPasswordInput
            key='mail_pw'
            id='mail_pw'
            label={tx('password')}
            placeholder={tx('password')}
            password={mail_pw}
            onChange={this.handleCredentialsChange}
          />
          <DeltaText>{tx('login_no_servers_hint')}</DeltaText>
          <AdvancedButton onClick={this.handleUISwitchStateProperty.bind(this, 'showAdvanced')} id={'show-advanced-button'}>
            {(showAdvanced ? <AdvancedButtonIconClosed /> : <AdvancedButtonIconOpen />)}
            <p>{tx('menu_advanced') }</p>
          </AdvancedButton>
          <Collapse isOpen={showAdvanced}>
            <br />
            <DeltaHeadline>{tx('login_inbox')}</DeltaHeadline>

            <DeltaInput
              key='mail_user'
              id='mail_user'
              placeholder={tx('login_imap_login')}
              type='text'
              value={mail_user}
              onChange={this.handleCredentialsChange}
            />

            <DeltaInput
              key='mail_server'
              id='mail_server'
              placeholder={tx('login_imap_server')}
              type='text'
              value={mail_server}
              onChange={this.handleCredentialsChange}
            />
            <DeltaInput
              key='mail_port'
              id='mail_port'
              placeholder={tx('login_imap_port')}
              type='number'
              min='0'
              max='65535'
              value={mail_port}
              onChange={this.handleCredentialsChange}
            />

            <DeltaSelect
              id='mail_security'
              label={tx('login_imap_security')}
              value={mail_security}
              onChange={this.handleCredentialsChange}
            >
              <option value='automatic'>Automatic</option>
              <option value='ssl'>SSL/TLS</option>
              <option value='starttls'>STARTTLS</option>
              <option value='plain'>{tx('off')}</option>
            </DeltaSelect>

            <DeltaHeadline>{tx('login_outbox')}</DeltaHeadline>
            <DeltaInput
              key='send_user'
              id='send_user'
              placeholder={tx('login_smtp_login')}
              value={send_user}
              onChange={this.handleCredentialsChange}
            />
            <DeltaPasswordInput
              key='send_pw'
              id='send_pw'
              placeholder={tx('login_smtp_password')}
              password={send_pw}
              onChange={this.handleCredentialsChange}
            />
            <DeltaInput
              key='send_server'
              id='send_server'
              placeholder={tx('login_smtp_server')}
              type='text'
              value={send_server}
              onChange={this.handleCredentialsChange}
            />
            <DeltaInput
              key='send_port'
              id='send_port'
              placeholder={tx('login_smtp_port')}
              type='number'
              min='0'
              max='65535'
              value={send_port}
              onChange={this.handleCredentialsChange}
            />
            <DeltaSelect
              id='send_security'
              label={tx('login_smtp_security')}
              value={send_security}
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
              <DeltaProgressBar
                progress={this.state.progress}
                intent={Intent.SUCCESS}
              />
          }
          {React.Children.map(this.props.children, (child) => {
            var props = {}
            if (child.props.type === 'submit') {
              props.disabled = loading || (!addr || !mail_pw) || (showAdvanced && !send_pw) || !dirty || disableSubmit
            }
            if (child.props.type === 'cancel') {
              if (!loading) return
              props.onClick = this.cancelClick.bind(this)
            }
            return React.cloneElement(child, props)
          })}

        </form>
      </React.Fragment>
    )
  }
}
