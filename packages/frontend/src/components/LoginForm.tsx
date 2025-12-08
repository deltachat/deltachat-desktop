import { C, T } from '@deltachat/jsonrpc-client'
import React, { useState } from 'react'
import { useDebouncedCallback } from 'use-debounce/lib'

import { DeltaInput, DeltaSelect } from './Login-Styles'
import { ClickableLink } from './helpers/ClickableLink'
import { getLogger } from '../../../shared/logger'
import { BackendRemote, Type } from '../backend-com'
import Collapse from './Collapse'
import { I18nContext } from '../contexts/I18nContext'

const log = getLogger('renderer/loginForm')

import type { Credentials } from './Settings/DefaultCredentials'

const Socket = {
  automatic: 'automatic',
  plain: 'plain',
  ssl: 'ssl',
  starttls: 'starttls',
} as const satisfies { [P in T.Socket]: P }

const CertificateChecks = {
  automatic: 'automatic',
  strict: 'strict',
  acceptInvalidCertificates: 'acceptInvalidCertificates',
} as const satisfies { [P in T.EnteredCertificateChecks]: P }

type LoginProps = React.PropsWithChildren<{
  credentials: Credentials
  setCredentials: (credentials: Credentials) => void
}>

export default function LoginForm({ credentials, setCredentials }: LoginProps) {
  const [uiShowAdvanced, setUiShowAdvanced] = useState<boolean>(false)
  const [providerInfo, setProviderInfo] = useState<
    Type.ProviderInfo | undefined
  >()

  const handleCredentialsChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { id, value } = event.target
    if (!Object.keys(credentials).includes(id)) {
      log.error('unknown credentials key', id)
      return
    }
    // convert empty string values to null with some exceptions
    let typeSafeValue: string | number | null = value === '' ? null : value
    if ((id === 'smtpPort' || id === 'imapPort') && typeSafeValue !== null) {
      typeSafeValue = Number(value)
    }
    if ((id === 'addr' || id === 'password') && typeSafeValue === null) {
      // these must be of type string
      typeSafeValue = ''
    }
    setCredentials({ ...credentials, [id]: typeSafeValue })
  }

  const [debouncedGetProviderInfo] = useDebouncedCallback(
    async (addr: string) => {
      if (window.__selectedAccountId === undefined) {
        setProviderInfo(undefined)
        return
      }
      const result: any = await BackendRemote.rpc.getProviderInfo(
        window.__selectedAccountId,
        addr
      )
      setProviderInfo(result || null)
    },
    500
  )

  const onEmailChange = (
    event: React.FormEvent<HTMLElement> & React.ChangeEvent<HTMLInputElement>
  ) => {
    handleCredentialsChange(event)
    const email = event.target.value
    if (email === '') {
      setProviderInfo(undefined)
      return
    }
  }

  const onEmailBlur = (
    event: React.FormEvent<HTMLElement> & React.FocusEvent<HTMLInputElement>
  ) => {
    const email = event.target.value
    if (email === '') {
      setProviderInfo(undefined)
      return
    }
    debouncedGetProviderInfo(email)
  }

  const {
    addr,
    imapUser,
    password,
    imapServer,
    imapPort,
    imapSecurity,
    certificateChecks,
    smtpUser,
    smtpPassword,
    smtpServer,
    smtpPort,
    smtpSecurity,
  } = credentials

  return (
    <I18nContext.Consumer>
      {({ tx }) => (
        <div className='login-form'>
          <DeltaInput
            key='addr'
            id='addr'
            placeholder={tx('email_address')}
            value={addr}
            onChange={onEmailChange}
            onBlur={onEmailBlur}
          />

          <DeltaInput
            key='password'
            id='password'
            type='password'
            placeholder={tx('existing_password')}
            value={password || ''}
            onChange={handleCredentialsChange}
          />

          {providerInfo?.beforeLoginHint && (
            <div
              className={`before-login-hint ${
                providerInfo.status === C.DC_PROVIDER_STATUS_BROKEN
                  ? 'broken'
                  : ''
              }`}
            >
              <p>{providerInfo.beforeLoginHint}</p>
              <ClickableLink href={providerInfo.overviewPage}>
                {tx('more_info_desktop')}
              </ClickableLink>
            </div>
          )}

          <p className='text'>{tx('login_advanced_hint')}</p>
          <button
            type='button'
            className='advanced'
            aria-controls='advanced-collapse'
            onClick={() => setUiShowAdvanced(!uiShowAdvanced)}
            id={'show-advanced-button'}
          >
            <div className={`advanced-icon ${uiShowAdvanced && 'opened'}`} />
            <p>{tx('menu_more_options')}</p>
          </button>
          <Collapse id='advanced-collapse' isOpen={uiShowAdvanced}>
            <br />
            <p className='delta-headline'>{tx('login_inbox')}</p>

            <DeltaInput
              key='imapUser'
              id='imapUser'
              placeholder={tx('automatic')}
              label={tx('login_imap_login')}
              type='text'
              value={imapUser}
              onChange={handleCredentialsChange}
            />

            <DeltaInput
              key='imapServer'
              id='imapServer'
              placeholder={tx('automatic')}
              label={tx('login_imap_server')}
              type='text'
              value={imapServer}
              onChange={handleCredentialsChange}
            />
            <DeltaInput
              key='imapPort'
              id='imapPort'
              label={tx('login_imap_port')}
              placeholder={tx('def')}
              type='number'
              min='0'
              max='65535'
              value={imapPort}
              onChange={handleCredentialsChange}
            />

            <DeltaSelect
              id='imapSecurity'
              label={tx('login_imap_security')}
              value={imapSecurity}
              onChange={handleCredentialsChange as any}
            >
              <option value={Socket.automatic}>{tx('automatic')}</option>
              <option value={Socket.ssl}>SSL/TLS</option>
              <option value={Socket.starttls}>STARTTLS</option>
              <option value={Socket.plain}>{tx('off')}</option>
            </DeltaSelect>

            <p className='delta-headline'>{tx('login_outbox')}</p>
            <DeltaInput
              key='smtpUser'
              id='smtpUser'
              placeholder={tx('automatic')}
              label={tx('login_smtp_login')}
              value={smtpUser}
              onChange={handleCredentialsChange}
            />
            <DeltaInput
              key='smtpPassword'
              id='smtpPassword'
              label={tx('login_smtp_password')}
              placeholder={tx('automatic')}
              type='password'
              value={smtpPassword || ''}
              onChange={handleCredentialsChange}
            />
            <DeltaInput
              key='smtpServer'
              id='smtpServer'
              placeholder={tx('automatic')}
              label={tx('login_smtp_server')}
              type='text'
              value={smtpServer}
              onChange={handleCredentialsChange}
            />
            <DeltaInput
              key='smtpPort'
              id='smtpPort'
              placeholder={tx('def')}
              label={tx('login_smtp_port')}
              type='number'
              min='0'
              max='65535'
              value={smtpPort}
              onChange={handleCredentialsChange}
            />
            <DeltaSelect
              id='smtpSecurity'
              label={tx('login_smtp_security')}
              value={smtpSecurity}
              onChange={handleCredentialsChange as any}
            >
              <option value={Socket.automatic}>{tx('automatic')}</option>
              <option value={Socket.ssl}>SSL/TLS</option>
              <option value={Socket.starttls}>STARTTLS</option>
              <option value={Socket.plain}>{tx('off')}</option>
            </DeltaSelect>

            <DeltaSelect
              id='certificateChecks'
              label={tx('login_certificate_checks')}
              value={certificateChecks}
              onChange={handleCredentialsChange as any}
            >
              <option value={CertificateChecks.automatic}>
                {tx('automatic')}
              </option>
              <option value={CertificateChecks.strict}>{tx('strict')}</option>
              <option value={CertificateChecks.acceptInvalidCertificates}>
                {tx('accept_invalid_certificates')}
              </option>
            </DeltaSelect>
          </Collapse>
          <br />
        </div>
      )}
    </I18nContext.Consumer>
  )
}
