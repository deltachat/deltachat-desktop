/* eslint-disable camelcase */

import { DeltaChat } from 'deltachat-node'
import { C } from 'deltachat-node/dist/constants'
import React, { useEffect, useState } from 'react'
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
import { any, string } from 'prop-types'
import { protocol } from 'electron'
import { render } from 'react-dom'
import { DialogProps } from './dialogs/DialogController'
import { sendToBackend, ipcBackend } from '../ipc'
import { SmallDialog, DeltaDialogHeader, DeltaDialogBody, DeltaDialogContent, DeltaDialogFooter } from './dialogs/DeltaDialog'
import { title } from 'process'
import { Credentials } from '../../shared/shared-types'


const getDefaultPort = (credentials: Credentials, protocol: string) => {
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
  const { mail_security, send_security } = credentials
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

export function defaultCredentials(credentials?: Credentials): Credentials {
  credentials = !credentials ? {} : credentials
  return {
    addr: credentials.addr || '',
    mail_user: credentials.mail_user || '',
    mail_pw: credentials.mail_pw || '',
    mail_server: credentials.mail_server || '',
    mail_port: credentials.mail_port || '',
    mail_security: credentials.mail_security || '',
    imap_certificate_checks: credentials.imap_certificate_checks || '',
    send_user: credentials.send_user || '',
    send_pw: credentials.send_pw || '',
    send_server: credentials.send_server || '',
    send_port: credentials.send_port || '',
    send_security: credentials.send_security || '',
    smtp_certificate_checks: credentials.smtp_certificate_checks || '',
  }
}


type LoginProps = React.PropsWithChildren<
  {
    credentials : Credentials
    setCredentials: (credentials: Credentials) => void
    addrDisabled? : boolean 
  }
>

export default function LoginForm({credentials, setCredentials, addrDisabled}:LoginProps) {

  const [uiShowAdvanced, setUiShowAdvanced] = useState<boolean>(false)
  const [providerInfo, setProviderInfo] = useState<ReturnType<typeof DeltaChat.getProviderFromEmail>>(null)

  const handleCredentialsChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = event.target
    let changeCredentials = {}
    if (id === 'certificate_checks') {
      // Change to certificate_checks updates certificate checks configuration
      // for all protocols.
      
      changeCredentials = {
        imap_certificate_checks: value,
        smtp_certificate_checks: value,
      }
    } else {
      changeCredentials = {
        [id]: value,
      }
    }

    const updatedCredentials = {...credentials, ...changeCredentials}
    setCredentials(updatedCredentials)
  }

  const emailChange = async (
    event: React.FormEvent<HTMLElement> & React.ChangeEvent<HTMLInputElement>
  ) => {
    handleCredentialsChange(event)
    const result = (await DeltaBackend.call(
      'getProviderInfo',
      event.target.value
    )) as any
    setProviderInfo(result || null)
  }

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
  } = credentials

  // We assume that smtp_certificate_checks has the same value.
  const certificate_checks = imap_certificate_checks


  const tx = window.translate

  return (
    <div className='login-form'>
      <DeltaInput
        key='addr'
        id='addr'
        placeholder={tx('email_address')}
        disabled={addrDisabled}
        value={addr}
        onChange={emailChange.bind(this)}
      />

      <DeltaPasswordInput
        key='mail_pw'
        id='mail_pw'
        placeholder={tx('password')}
        password={mail_pw}
        onChange={handleCredentialsChange}
      />

      {providerInfo?.before_login_hint && (
        <div
          className={`before-login-hint ${providerInfo.status ===
            C.DC_PROVIDER_STATUS_BROKEN && 'broken'}`}
        >
          <p>{providerInfo.before_login_hint}</p>
          <ClickableLink href={providerInfo.overview_page}>
            {tx('more_info_desktop')}
          </ClickableLink>
        </div>
      )}

      <p className='text'>{tx('login_no_servers_hint')}</p>
      <div
        className='advanced'
        onClick={() => setUiShowAdvanced(!uiShowAdvanced)}
        id={'show-advanced-button'}
      >
        <div className={`advanced-icon ${uiShowAdvanced && 'opened'}`} />
        <p>{tx('menu_advanced')}</p>
      </div>
      <Collapse isOpen={uiShowAdvanced}>
        <br />
        <p className='delta-headline'>{tx('login_inbox')}</p>

        <DeltaInput
          key='mail_user'
          id='mail_user'
          placeholder={tx('default_value_as_above')}
          label={tx('login_imap_login')}
          type='text'
          value={mail_user}
          onChange={handleCredentialsChange}
        />

        <DeltaInput
          key='mail_server'
          id='mail_server'
          placeholder={tx('default_value_automatic')}
          label={tx('login_imap_server')}
          type='text'
          value={mail_server}
          onChange={handleCredentialsChange}
        />
        <DeltaInput
          key='mail_port'
          id='mail_port'
          label={tx('login_imap_port')}
          placeholder={tx(
            'default_value',
            String(getDefaultPort(credentials, 'imap'))
          )}
          type='number'
          min='0'
          max='65535'
          value={mail_port}
          onChange={handleCredentialsChange}
        />

        <DeltaSelect
          id='mail_security'
          label={tx('login_imap_security')}
          value={mail_security}
          onChange={handleCredentialsChange as any}
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
          onChange={handleCredentialsChange}
        />
        <DeltaPasswordInput
          key='send_pw'
          id='send_pw'
          label={tx('login_smtp_password')}
          placeholder={tx('default_value_as_above')}
          password={send_pw}
          onChange={handleCredentialsChange}
        />
        <DeltaInput
          key='send_server'
          id='send_server'
          placeholder={tx('default_value_automatic')}
          label={tx('login_smtp_server')}
          type='text'
          value={send_server}
          onChange={handleCredentialsChange}
        />
        <DeltaInput
          key='send_port'
          id='send_port'
          placeholder={tx(
            'default_value',
            String(getDefaultPort(credentials, 'smtp'))
          )}
          label={tx('login_smtp_port')}
          type='number'
          min='0'
          max='65535'
          value={send_port}
          onChange={handleCredentialsChange}
        />
        <DeltaSelect
          id='send_security'
          label={tx('login_smtp_security')}
          value={send_security}
          onChange={handleCredentialsChange as any}
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
          onChange={handleCredentialsChange as any}
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
    </div>
  )
}


export function ConfigureProgressDialog({isOpen, onClose, credentials, onSuccess}: DialogProps) {
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState('')


  const onConfigureProgress = (_: null, [progress, _data2] : [number, null]) => setProgress(progress)

  const onCancel = (event: any) => {
    console.log('onCancel!')
    DeltaBackend.call('stopOngoingProcess')
    onClose() 
  }

  const onConfigureSuccessful = () => {
    onClose()
    onSuccess && onSuccess()
  }
  const onConfigureFailed = (_: null, [data1, data2] : [null, string]) => setError(data2)

  useEffect(() => {
    console.log(credentials)
    DeltaBackend.call('login.newLogin', credentials)
    ipcBackend.on('DC_EVENT_CONFIGURE_PROGRESS', onConfigureProgress)
    ipcBackend.on('DCN_EVENT_CONFIGURE_SUCCESSFUL', onConfigureSuccessful)
    ipcBackend.on('DC_EVENT_ERROR', onConfigureFailed)
    return () => {
      ipcBackend.removeListener('DC_EVENT_CONFIGURE_PROGRESS', onConfigureProgress)
      ipcBackend.removeListener('DCN_EVENT_CONFIGURE_SUCCESSFUL', onConfigureSuccessful)
      ipcBackend.removeListener('DC_EVENT_ERROR', onConfigureFailed)
    }
  }, [])

  const tx = window.translate

  return (
    <SmallDialog isOpen={isOpen} onClose={onClose}>
      {!error && (
        <>
          <div className='bp3-dialog-body-with-padding'>
            <DeltaDialogContent>
              <DeltaProgressBar progress={progress} />
            </DeltaDialogContent>
          </div>
          <DeltaDialogFooter
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginTop: '0px',
              padding: '7px 13px 10px 13px',
            }}
          >
            <p
              className='delta-button danger bold'
              onClick={onCancel}
            >
              {tx('cancel')}
            </p>
          </DeltaDialogFooter>
        </>
      )}
      {error && (
        <>
          <div className='bp3-dialog-body-with-padding'>
            <DeltaDialogContent>
              <p>{error}</p>
            </DeltaDialogContent>
          </div>
          <DeltaDialogFooter
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginTop: '0px',
              padding: '7px 13px 10px 13px',
            }}
          >
            <p
            className='delta-button primary bold'
              onClick={onClose}
              style={{marginLeft: 'auto'}}
            >
              {tx('ok')}
            </p>
          </DeltaDialogFooter>
        </>
      )}
    </SmallDialog>
  )
}