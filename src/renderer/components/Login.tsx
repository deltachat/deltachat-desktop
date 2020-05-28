/* eslint-disable camelcase */

import { DeltaChat } from 'deltachat-node'
import { C } from 'deltachat-node/dist/constants'
import React from 'react'
const { ipcRenderer } = window.electron_functions
import update from 'immutability-helper'
import {
  DeltaInput,
  DeltaPasswordInput,
  DeltaSelect,
  DeltaProgressBar,
} from './Login-Styles'
import { Collapse, Intent } from '@blueprintjs/core'
import { DeltaBackend } from '../delta-remote'
import ClickableLink from './helpers/ClickableLink'

export type credentialState = {
  [key: string]: any
  addr?: string
  mail_user?: string
  mail_pw?: string
  mail_server?: string
  mail_port?: string
  mail_security?: 'automatic' | '' | 'ssl' | 'default'
  imap_certificate_checks?: any
  send_user?: string
  send_pw?: string
  send_server?: string
  send_port?: string
  send_security?: 'automatic' | '' | 'ssl' | 'starttls' | 'plain'
  smtp_certificate_checks?: any
}

type LoginProps = React.PropsWithChildren<
  {
    [key: string]: any
    mode?: 'update'
  } & credentialState
>

type LoginComponentState = {
  credentials: credentialState
  ui: {
    showAdvanced: boolean
    showPasswordMail: boolean
    showPasswordSend: boolean
    [key: string]: boolean
  }
  progress: number
  dirty: boolean
  disableSubmit: boolean
  provider_info: ReturnType<typeof DeltaChat.getProviderFromEmail>
}

export default class Login extends React.Component<
  LoginProps,
  LoginComponentState
> {
  constructor(props: LoginProps) {
    super(props)
    this.state = {
      credentials: this._defaultCredentials(),
      ui: {
        showAdvanced: false,
        showPasswordMail: false,
        showPasswordSend: false,
      },
      progress: 0,
      dirty: false,
      disableSubmit: false,
      provider_info: null,
    }
    this._updateProgress = this._updateProgress.bind(this)
    this.handleCredentialsChange = this.handleCredentialsChange.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
  }

  componentDidMount() {
    ipcRenderer.on('DC_EVENT_CONFIGURE_PROGRESS', this._updateProgress)
  }

  componentWillUnmount() {
    ipcRenderer.removeListener(
      'DC_EVENT_CONFIGURE_PROGRESS',
      this._updateProgress
    )
  }

  _updateProgress(ev: any, [progress, _]: [number, any]) {
    this.setState({ progress })
  }

  _defaultCredentials(): credentialState {
    return {
      addr: this.props.addr || '',
      mail_user: this.props.mail_user || '',
      mail_pw: this.props.mail_pw || '',
      mail_server: this.props.mail_server || '',
      mail_port: this.props.mail_port || '',
      mail_security: this.props.mail_security || '',
      imap_certificate_checks: this.props.imap_certificate_checks || '',
      send_user: this.props.send_user || '',
      send_pw: this.props.send_pw || '',
      send_server: this.props.send_server || '',
      send_port: this.props.send_port || '',
      send_security: this.props.send_security || '',
      smtp_certificate_checks: this.props.smtp_certificate_checks || '',
    }
  }

  handleCredentialsChange(event: React.ChangeEvent<HTMLInputElement>) {
    const { mode } = this.props
    const { id, value } = event.target
    let updatedCredentials
    if (id === 'certificate_checks') {
      // Change to certificate_checks updates certificate checks configuration
      // for all protocols.
      updatedCredentials = {
        imap_certificate_checks: { $set: value },
        smtp_certificate_checks: { $set: value },
      }
    } else {
      updatedCredentials = {
        [id]: { $set: value },
      }
    }

    const updatedState: any = update(this.state, {
      credentials: updatedCredentials,
    })
    let dirty = false
    if (mode === 'update') {
      dirty =
        Object.keys(updatedState.credentials).find(
          key => this.props[key] !== updatedState.credentials[key]
        ) !== undefined
    } else {
      dirty =
        Object.keys(updatedState.credentials).find(
          key => updatedState.credentials[key] !== ''
        ) !== undefined
    }
    updatedState.dirty = dirty
    updatedState.disableSubmit = false
    this.setState(updatedState)
  }

  async emailChange(
    event: React.FormEvent<HTMLElement> & React.ChangeEvent<HTMLInputElement>
  ) {
    this.handleCredentialsChange(event)
    const result = (await DeltaBackend.call(
      'getProviderInfo',
      event.target.value
    )) as any
    this.setState({ provider_info: result || null })
  }

  handleSubmit(event: any) {
    const { mode } = this.props
    const credentials = this.state.credentials
    this.props.onSubmit(credentials)
    event.preventDefault()
    if (mode !== 'update') {
      this.setState({ disableSubmit: true })
    }
  }

  handleUISwitchStateProperty(key: string) {
    const stateUi = Object.assign(this.state.ui, { [key]: !this.state.ui[key] })
    this.setState({ ui: stateUi })
  }

  cancelClick(event: any) {
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

  renderLoginHeader(mode: string) {
    return mode === 'update' ? null : (
      <p className='text'>{window.translate('login_explain')}</p>
    )
  }

  _getDefaultPort(protocol: string) {
    const SendSecurityPortMap = {
      imap: {
        ssl: 993,
        default: 143,
      },
      smtp: {
        ssl: 465,
        starttls: 587,
        plain: 25,
      },
    }
    const { mail_security, send_security } = this.state.credentials
    if (protocol === 'imap') {
      if (
        mail_security === 'automatic' ||
        mail_security === '' ||
        mail_security === 'ssl'
      ) {
        return SendSecurityPortMap.imap['ssl']
      } else {
        return SendSecurityPortMap.imap['default']
      }
    } else {
      if (
        send_security === 'automatic' ||
        send_security === '' ||
        send_security === 'ssl'
      ) {
        return SendSecurityPortMap.smtp['ssl']
      } else {
        return SendSecurityPortMap.smtp[send_security]
      }
    }
  }

  render() {
    const { addrDisabled, loading, mode } = this.props
    const { disableSubmit } = this.state

    const {
      addr,
      mail_user,
      mail_pw,
      mail_server,
      mail_port,
      mail_security,
      imap_certificate_checks,
      send_user,
      send_pw,
      send_server,
      send_port,
      send_security,
    } = this.state.credentials

    // We assume that smtp_certificate_checks has the same value.
    const certificate_checks = imap_certificate_checks

    const { showAdvanced } = this.state.ui

    const { dirty, provider_info } = this.state

    const tx = window.translate

    return (
      <React.Fragment>
        {this.renderLoginHeader(mode)}
        <form onSubmit={this.handleSubmit} className='login-form'>
          <DeltaInput
            key='addr'
            id='addr'
            placeholder={tx('email_address')}
            disabled={addrDisabled}
            value={addr}
            onChange={this.emailChange.bind(this)}
          />

          <DeltaPasswordInput
            key='mail_pw'
            id='mail_pw'
            placeholder={tx('password')}
            password={mail_pw}
            onChange={this.handleCredentialsChange}
          />

          {provider_info?.before_login_hint && (
            <div
              className={`before-login-hint ${provider_info.status ===
                C.DC_PROVIDER_STATUS_BROKEN && 'broken'}`}
            >
              <p>{provider_info.before_login_hint}</p>
              <ClickableLink href={provider_info.overview_page}>
                {tx('more_info_desktop')}
              </ClickableLink>
            </div>
          )}

          <p className='text'>{tx('login_no_servers_hint')}</p>
          <div
            className='advanced'
            onClick={this.handleUISwitchStateProperty.bind(
              this,
              'showAdvanced'
            )}
            id={'show-advanced-button'}
          >
            <div className={`advanced-icon ${showAdvanced && 'opened'}`} />
            <p>{tx('menu_advanced')}</p>
          </div>
          <Collapse isOpen={showAdvanced}>
            <br />
            <p className='delta-headline'>{tx('login_inbox')}</p>

            <DeltaInput
              key='mail_user'
              id='mail_user'
              placeholder={tx('default_value_as_above')}
              label={tx('login_imap_login')}
              type='text'
              value={mail_user}
              onChange={this.handleCredentialsChange}
            />

            <DeltaInput
              key='mail_server'
              id='mail_server'
              placeholder={tx('default_value_automatic')}
              label={tx('login_imap_server')}
              type='text'
              value={mail_server}
              onChange={this.handleCredentialsChange}
            />
            <DeltaInput
              key='mail_port'
              id='mail_port'
              label={tx('login_imap_port')}
              placeholder={tx(
                'default_value',
                String(this._getDefaultPort('imap'))
              )}
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
              onChange={this.handleCredentialsChange as any}
            >
              <option value='automatic'>{tx('automatic')}</option>
              <option value='ssl'>SSL/TLS</option>
              <option value='starttls'>STARTTLS</option>
              <option value='plain'>{tx('off')}</option>
            </DeltaSelect>

            <p className='delta-headline'>{tx('login_outbox')}</p>
            <DeltaInput
              key='send_user'
              id='send_user'
              placeholder={tx('default_value_as_above')}
              label={tx('login_smtp_login')}
              value={send_user}
              onChange={this.handleCredentialsChange}
            />
            <DeltaPasswordInput
              key='send_pw'
              id='send_pw'
              label={tx('login_smtp_password')}
              placeholder={tx('default_value_as_above')}
              password={send_pw}
              onChange={this.handleCredentialsChange}
            />
            <DeltaInput
              key='send_server'
              id='send_server'
              placeholder={tx('default_value_automatic')}
              label={tx('login_smtp_server')}
              type='text'
              value={send_server}
              onChange={this.handleCredentialsChange}
            />
            <DeltaInput
              key='send_port'
              id='send_port'
              placeholder={tx(
                'default_value',
                String(this._getDefaultPort('smtp'))
              )}
              label={tx('login_smtp_port')}
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
              onChange={this.handleCredentialsChange as any}
            >
              <option value='automatic'>{tx('automatic')}</option>
              <option value='ssl'>SSL/TLS</option>
              <option value='starttls'>STARTTLS</option>
              <option value='plain'>{tx('off')}</option>
            </DeltaSelect>

            <DeltaSelect
              id='certificate_checks'
              label={tx('login_certificate_checks')}
              value={certificate_checks}
              onChange={this.handleCredentialsChange as any}
            >
              <option value={C.DC_CERTCK_AUTO}>{tx('automatic')}</option>
              <option value={C.DC_CERTCK_STRICT}>{tx('strict')}</option>
              <option value={C.DC_CERTCK_ACCEPT_INVALID_CERTIFICATES}>
                {tx('accept_invalid_certificates')}
              </option>
            </DeltaSelect>
          </Collapse>
          <br />
          <p className='text'>{tx('login_subheader')}</p>
          {loading && (
            <DeltaProgressBar
              progress={this.state.progress}
              intent={Intent.SUCCESS}
            />
          )}
          {React.Children.map(this.props.children, (child: any) => {
            var props: { disabled?: boolean; onClick?: any } = {}
            if (child.props.type === 'submit') {
              props.disabled =
                loading || !addr || !mail_pw || !dirty || disableSubmit
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
