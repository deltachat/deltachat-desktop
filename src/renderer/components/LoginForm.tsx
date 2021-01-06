/* eslint-disable camelcase */

import type { DeltaChat } from 'deltachat-node'
import { C } from 'deltachat-node/dist/constants'
import React, { useEffect, useState } from 'react'
import {
  DeltaInput,
  DeltaPasswordInput,
  DeltaSelect,
  DeltaProgressBar,
} from './Login-Styles'
import { Collapse, Dialog } from '@blueprintjs/core'
import { DeltaBackend } from '../delta-remote'
import ClickableLink from './helpers/ClickableLink'
import { DialogProps } from './dialogs/DialogController'
import { ipcBackend } from '../ipc'
import { DeltaDialogContent, DeltaDialogFooter } from './dialogs/DeltaDialog'
import { Credentials, DeltaChatAccount } from '../../shared/shared-types'
import { useTranslationFunction, i18nContext } from '../contexts'
import { useDebouncedCallback } from 'use-debounce/lib'
import { isValidEmail } from '../../shared/util'

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
      mail_security === C.DC_SOCKET_AUTO.toString() ||
      mail_security === '' ||
      mail_security === C.DC_SOCKET_SSL.toString()
    ) {
      return SendSecurityPortMap.imap['ssl']
    } else {
      return SendSecurityPortMap.imap['default']
    }
  } else {
    if (
      send_security === C.DC_SOCKET_AUTO.toString() ||
      send_security === '' ||
      send_security === C.DC_SOCKET_SSL.toString()
    ) {
      return SendSecurityPortMap.smtp['ssl']
    } else if (send_security === C.DC_SOCKET_STARTTLS.toString()) {
      return SendSecurityPortMap.smtp['starttls']
    } else if (send_security === C.DC_SOCKET_PLAIN.toString()) {
      return SendSecurityPortMap.smtp['plain']
    } else {
      return SendSecurityPortMap.smtp['ssl']
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

type LoginProps = React.PropsWithChildren<{
  credentials: Credentials
  setCredentials: (credentials: Credentials) => void
  addrDisabled?: boolean
}>

export default function LoginForm({
  credentials,
  setCredentials,
  addrDisabled,
}: LoginProps) {
  const [uiShowAdvanced, setUiShowAdvanced] = useState<boolean>(false)
  const [providerInfo, setProviderInfo] = useState<
    ReturnType<typeof DeltaChat.getProviderFromEmail>
  >(null)

  const handleCredentialsChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
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

    const updatedCredentials = { ...credentials, ...changeCredentials }
    setCredentials(updatedCredentials)
  }

  const [debouncedGetProviderInfo] = useDebouncedCallback(
    async (addr: string) => {
      const result: any = await DeltaBackend.call('getProviderInfo', addr)
      setProviderInfo(result || null)
    },
    300,
    { trailing: true }
  )

  const onEmailChange = (
    event: React.FormEvent<HTMLElement> & React.ChangeEvent<HTMLInputElement>
  ) => {
    handleCredentialsChange(event)
    const email = event.target.value
    isValidEmail(email) && debouncedGetProviderInfo(email)
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

  return (
    <i18nContext.Consumer>
      {tx => (
        <div className='login-form'>
          <DeltaInput
            key='addr'
            id='addr'
            placeholder={tx('email_address')}
            disabled={addrDisabled}
            value={addr}
            onChange={onEmailChange}
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
              className={`before-login-hint ${
                providerInfo.status === C.DC_PROVIDER_STATUS_BROKEN && 'broken'
              }`}
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
              placeholder={tx('automatic')}
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
              <option value={C.DC_SOCKET_AUTO}>{tx('automatic')}</option>
              <option value={C.DC_SOCKET_SSL}>SSL/TLS</option>
              <option value={C.DC_SOCKET_STARTTLS}>STARTTLS</option>
              <option value={C.DC_SOCKET_PLAIN}>{tx('off')}</option>
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
              placeholder={tx('automatic')}
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
              <option value={C.DC_SOCKET_AUTO}>{tx('automatic')}</option>
              <option value={C.DC_SOCKET_SSL}>SSL/TLS</option>
              <option value={C.DC_SOCKET_STARTTLS}>STARTTLS</option>
              <option value={C.DC_SOCKET_PLAIN}>{tx('off')}</option>
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
      )}
    </i18nContext.Consumer>
  )
}

export function ConfigureProgressDialog({
  isOpen,
  onClose,
  credentials,
  onSuccess,
  mode,
}: DialogProps) {
  const [progress, setProgress] = useState(0)
  const [progressComment, setProgressComment] = useState('')
  const [error, setError] = useState('')
  const [configureFailed, setConfigureFailed] = useState(false)

  const onConfigureProgress = (
    _: null,
    [progress, comment]: [number, null]
  ) => {
    progress !== 0 && setProgress(progress)
    setProgressComment(comment)
  }

  const onCancel = (_event: any) => {
    DeltaBackend.call('stopOngoingProcess')
    onClose()
  }

  const onConfigureSuccessful = (account: DeltaChatAccount) => {
    onClose()
    onSuccess && onSuccess(account)
  }
  const onConfigureError = (_: null, [_data1, data2]: [null, string]) =>
    setError(data2)

  const onConfigureFailed = (_: null, [_data1, _data2]: [null, string]) =>
    setConfigureFailed(true)

  useEffect(() => {
    ;(async () => {
      if (mode === 'update') {
        DeltaBackend.call('login.updateCredentials', credentials)
      } else {
        let account: DeltaChatAccount = null
        try {
          account = await DeltaBackend.call('login.newLogin', credentials)
        } catch (err) {
          if (err) {
            onConfigureError(null, [null, err])
            onConfigureFailed(null, [null, null])
          }
          return
        }
        if (account !== null) onConfigureSuccessful(account)
      }
    })()

    ipcBackend.on('DC_EVENT_CONFIGURE_PROGRESS', onConfigureProgress)
    ipcBackend.on('DCN_EVENT_CONFIGURE_FAILED', onConfigureFailed)
    ipcBackend.on('DC_EVENT_ERROR', onConfigureError)
    return () => {
      ipcBackend.removeListener(
        'DC_EVENT_CONFIGURE_PROGRESS',
        onConfigureProgress
      )
      ipcBackend.removeListener('DCN_EVENT_CONFIGURE_FAILED', onConfigureFailed)
      ipcBackend.removeListener('DC_EVENT_ERROR', onConfigureError)
    }
  }, [])

  const tx = useTranslationFunction()

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      className='delta-dialog small-dialog'
      canEscapeKeyClose={false}
      canOutsideClickClose={false}
    >
      {!configureFailed && (
        <>
          <div className='bp3-dialog-body-with-padding'>
            <DeltaDialogContent>
              <DeltaProgressBar progress={progress} />
              <p style={{ userSelect: 'auto' }}>{progressComment}</p>
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
            <p className='delta-button danger bold' onClick={onCancel}>
              {tx('cancel')}
            </p>
          </DeltaDialogFooter>
        </>
      )}
      {configureFailed && (
        <>
          <div className='bp3-dialog-body-with-padding'>
            <DeltaDialogContent>
              <p style={{ userSelect: 'auto' }}>{error}</p>
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
              style={{ marginLeft: 'auto' }}
            >
              {tx('ok')}
            </p>
          </DeltaDialogFooter>
        </>
      )}
    </Dialog>
  )
}
