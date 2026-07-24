import type { T } from '@deltachat/jsonrpc-client'
import React, { useState } from 'react'

import { DeltaInput, DeltaSelect } from './Login-Styles'
import { getLogger } from '@deltachat-desktop/shared/logger'
import Collapse from './Collapse'
import { I18nContext } from '../contexts/I18nContext'

const log = getLogger('renderer/loginForm')

import type { Credentials } from './Settings/DefaultCredentials'
import { useSettingsStore } from '../stores/settings'
import Switch from './Switch'

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
  forceEncryption?: boolean
  setForceEncryption?: (forceEncryption: boolean) => void
  /** whether editing existing account */
  isEdit?: true
}>

export default function LoginForm({
  credentials,
  setCredentials,
  forceEncryption: forceEncryptionProp,
  setForceEncryption,
  isEdit,
}: LoginProps) {
  const [uiShowAdvanced, setUiShowAdvanced] = useState<boolean>(false)
  const settingsStore = useSettingsStore()[0]
  const forceEncryption =
    forceEncryptionProp ?? settingsStore?.settings['force_encryption'] === '1'

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

  const {
    addr,
    imapUser,
    password,
    imapServer,
    imapPort,
    imapFolder,
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
            onChange={handleCredentialsChange}
            disabled={isEdit === true}
          />

          <DeltaInput
            key='password'
            id='password'
            type='password'
            placeholder={tx('existing_password')}
            value={password || ''}
            onChange={handleCredentialsChange}
          />

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
            {imapFolder !== null && (
              <>
                <DeltaInput
                  key='imapFolder'
                  id='imapFolder'
                  placeholder={tx('automatic')}
                  label='IMAP Folder'
                  type='text'
                  value={imapFolder}
                  onChange={handleCredentialsChange}
                  disabled
                />
              </>
            )}

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
            <div className='delta-form-group delta-switch'>
              <label>
                <span>{tx('enforce_e2ee')}</span>
                {/** be aware that this setting applies to all relays! */}
                <Switch
                  checked={forceEncryption}
                  disabled={settingsStore == null}
                  onChange={() => {
                    if (setForceEncryption) {
                      setForceEncryption(!forceEncryption)
                      return
                    }
                  }}
                />
              </label>
            </div>
          </Collapse>
          <br />
        </div>
      )}
    </I18nContext.Consumer>
  )
}
