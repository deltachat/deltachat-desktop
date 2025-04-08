/* eslint-disable camelcase */

import { C, DcEventType } from '@deltachat/jsonrpc-client'
import React, { useEffect, useRef, useState } from 'react'
import { useDebouncedCallback } from 'use-debounce/lib'

import {
  DeltaInput,
  DeltaPasswordInput,
  DeltaSelect,
  DeltaProgressBar,
} from './Login-Styles'
import { ClickableLink } from './helpers/ClickableLink'
import { getLogger } from '../../../shared/logger'
import { BackendRemote, Type } from '../backend-com'
import { selectedAccountId } from '../ScreenController'
import Dialog, {
  DialogBody,
  DialogContent,
  DialogFooter,
  FooterActionButton,
  FooterActions,
} from './Dialog'
import Collapse from './Collapse'
import { I18nContext } from '../contexts/I18nContext'
import useTranslationFunction from '../hooks/useTranslationFunction'
import { getDeviceChatId, saveLastChatId } from '../backend/chat'
import { EnteredLoginParam } from '@deltachat/jsonrpc-client/dist/generated/types'

import type { DialogProps } from '../contexts/DialogContext'
import SettingsSwitch from './Settings/SettingsSwitch'

const log = getLogger('renderer/loginForm')

export type Credentials = EnteredLoginParam & ProxySettings
export type ProxySettings = {
  proxyEnabled: boolean
  proxyUrl: string
}

export enum Proxy {
  DISABLED = '0',
  ENABLED = '1',
}

export enum Socket {
  AUTOMATIC = 'automatic',
  SSL = 'ssl',
  STARTTLS = 'starttls',
  PLAIN = 'plain',
}

export enum CertificateChecks {
  AUTOMATIC = 'automatic',
  STRICT = 'strict',
  ACCEPT_INVALID_CERTIFICATES = 'acceptInvalidCertificates',
}

export function defaultCredentials(credentials?: Credentials): Credentials {
  const defaultCredentials: Credentials = {
    addr: '',
    imapUser: null,
    password: '',
    imapServer: null,
    imapPort: null,
    imapSecurity: null,
    certificateChecks: null,
    smtpUser: null,
    smtpPassword: null,
    smtpServer: null,
    smtpPort: null,
    smtpSecurity: null,
    oauth2: null,
    proxyEnabled: false,
    proxyUrl: '',
  }

  return { ...defaultCredentials, ...credentials }
}

type LoginProps = React.PropsWithChildren<{
  credentials: Credentials
  setCredentials: (credentials: Credentials) => void
}>

export default function LoginForm({ credentials, setCredentials }: LoginProps) {
  const [uiShowAdvanced, setUiShowAdvanced] = useState<boolean>(false)
  const [providerInfo, setProviderInfo] = useState<
    Type.ProviderInfo | undefined
  >()

  // override existing credentials with new value
  const _handleCredentialsChange = (
    id: keyof Credentials,
    value: string | boolean
  ) => {
    setCredentials({ ...credentials, [id]: value })
  }

  const handleCredentialsChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { id, value } = event.target
    if (!Object.keys(credentials).includes(id)) {
      log.error('unknown credentials key', id)
      return
    }
    // convert string values
    let typeSafeValue: string | number | null = value === '' ? null : value
    if ((id === 'smtpPort' || id === 'imapPort') && typeSafeValue !== null) {
      typeSafeValue = Number(value)
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
    proxyEnabled,
    proxyUrl,
  } = credentials

  return (
    <I18nContext.Consumer>
      {tx => (
        <div className='login-form'>
          <DeltaInput
            key='addr'
            id='addr'
            placeholder={tx('email_address')}
            value={addr}
            onChange={onEmailChange}
            onBlur={onEmailBlur}
          />

          <DeltaPasswordInput
            key='password'
            id='password'
            placeholder={tx('existing_password')}
            password={password || ''}
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

          <p className='text'>{tx('login_no_servers_hint')}</p>
          <button
            className='advanced'
            aria-controls='advanced-collapse'
            onClick={() => setUiShowAdvanced(!uiShowAdvanced)}
            id={'show-advanced-button'}
          >
            <div className={`advanced-icon ${uiShowAdvanced && 'opened'}`} />
            <p>{tx('menu_advanced')}</p>
          </button>
          <Collapse id='advanced-collapse' isOpen={uiShowAdvanced}>
            <br />
            <p className='delta-headline'>{tx('login_inbox')}</p>

            <DeltaInput
              key='imapUser'
              id='imapUser'
              placeholder={tx('default_value_as_above')}
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
              <option value={Socket.AUTOMATIC}>{tx('automatic')}</option>
              <option value={Socket.SSL}>SSL/TLS</option>
              <option value={Socket.STARTTLS}>STARTTLS</option>
              <option value={Socket.PLAIN}>{tx('off')}</option>
            </DeltaSelect>

            <p className='delta-headline'>{tx('login_outbox')}</p>
            <DeltaInput
              key='smtpUser'
              id='smtpUser'
              placeholder={tx('default_value_as_above')}
              label={tx('login_smtp_login')}
              value={smtpUser}
              onChange={handleCredentialsChange}
            />
            <DeltaPasswordInput
              key='smtpPassword'
              id='smtpPassword'
              label={tx('login_smtp_password')}
              placeholder={tx('default_value_as_above')}
              password={smtpPassword || ''}
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
              <option value={Socket.AUTOMATIC}>{tx('automatic')}</option>
              <option value={Socket.SSL}>SSL/TLS</option>
              <option value={Socket.STARTTLS}>STARTTLS</option>
              <option value={Socket.PLAIN}>{tx('off')}</option>
            </DeltaSelect>

            <DeltaSelect
              id='certificateChecks'
              label={tx('login_certificate_checks')}
              value={certificateChecks}
              onChange={handleCredentialsChange as any}
            >
              <option value={CertificateChecks.AUTOMATIC}>
                {tx('automatic')}
              </option>
              <option value={CertificateChecks.STRICT}>{tx('strict')}</option>
              <option value={CertificateChecks.ACCEPT_INVALID_CERTIFICATES}>
                {tx('accept_invalid_certificates')}
              </option>
            </DeltaSelect>
            <SettingsSwitch
              label={tx('proxy_use_proxy')}
              value={proxyEnabled}
              onChange={(isTrue: boolean) =>
                _handleCredentialsChange('proxyEnabled', isTrue)
              }
            />
            {proxyEnabled && (
              <>
                <p className='text'>
                  Proxy support is currently experimental. Please use at your
                  own risk. If you type in an address in the e-mail field, there
                  will be a DNS lookup that won't get tunneled through proxy.
                </p>
                <p className='text'>{tx('proxy_add_explain')}</p>
                <DeltaInput
                  key='proxyUrl'
                  id='proxyUrl'
                  label={tx('proxy_add_url_hint')}
                  value={proxyUrl}
                  onChange={handleCredentialsChange}
                />
              </>
            )}
          </Collapse>
          <br />
          <p className='text'>{tx('login_subheader')}</p>
        </div>
      )}
    </I18nContext.Consumer>
  )
}

interface ConfigureProgressDialogProps {
  credentials?: Credentials
  onSuccess?: () => void
  onUserCancellation?: () => void
  onFail: (error: string) => void
  proxyUpdated?: boolean
}

export function ConfigureProgressDialog({
  credentials = defaultCredentials(),
  onSuccess,
  onUserCancellation,
  onFail,
  proxyUpdated = false,
  ...dialogProps
}: ConfigureProgressDialogProps & DialogProps) {
  const { onClose } = dialogProps
  const [progress, setProgress] = useState(0)
  const [progressComment, setProgressComment] = useState('')
  const accountId = selectedAccountId()
  const tx = useTranslationFunction()

  const onConfigureProgress = ({
    progress,
    comment,
  }: DcEventType<'ConfigureProgress'>) => {
    progress !== 0 && setProgress(progress)
    setProgressComment(comment || '')
  }

  const wasCanceled = useRef(false)

  const onCancel = async (_event: any) => {
    try {
      if (window.__selectedAccountId === undefined) {
        throw new Error('no selected account')
      }
      wasCanceled.current = true
      await BackendRemote.rpc.stopOngoingProcess(window.__selectedAccountId)
    } catch (error: any) {
      log.error('failed to stopOngoingProcess', error)
      onFail('failed to stopOngoingProcess' + error.message || error.toString())
      // If it fails to cancel but is still successful, it should behave like normal.
      wasCanceled.current = false
    }
    onClose()
  }

  useEffect(
    () => {
      ;(async () => {
        try {
          // Prepare initial configuration
          const initialConfig: Credentials = {
            ...credentials,
          }
          const { proxyEnabled, proxyUrl, ...transportConfig } = initialConfig
          // Set proxy settings if changed!
          if (proxyUpdated) {
            await BackendRemote.rpc.batchSetConfig(accountId, {
              proxy_enabled:
                proxyEnabled === true ? Proxy.ENABLED : Proxy.DISABLED,
              proxy_url: proxyUrl,
              verified_one_on_one_chats: '1', // do we still need this?
            })
          }
          if (
            transportConfig.addr !== undefined &&
            transportConfig.addr.length > 0
          ) {
            await BackendRemote.rpc.addTransport(accountId, transportConfig)
          }

          if (wasCanceled.current) {
            onClose()
            onUserCancellation?.()
            return
          }

          // Select 'Device Messages' chat as the initial one. This will serve
          // as a first introduction to the app after they've entered
          const deviceChatId = await getDeviceChatId(accountId)
          if (deviceChatId) {
            await saveLastChatId(accountId, deviceChatId)
            // SettingsStoreInstance is reloaded the first time the main screen is shown
          }

          // Yay! We're done and ready to go
          onClose()
          onSuccess && onSuccess()
        } catch (err: any) {
          log.error('configure error', err)
          onClose()
          onFail(err.message || err.toString())
        }
      })()
    },
    [wasCanceled] // eslint-disable-line react-hooks/exhaustive-deps
  )

  useEffect(() => {
    const emitter = BackendRemote.getContextEvents(accountId)
    emitter.on('ConfigureProgress', onConfigureProgress)
    return () => {
      emitter.off('ConfigureProgress', onConfigureProgress)
    }
  }, [accountId])

  return (
    <Dialog
      onClose={onClose}
      canEscapeKeyClose={false}
      canOutsideClickClose={false}
    >
      <DialogBody>
        <DialogContent paddingTop>
          <DeltaProgressBar progress={progress} />
          <p>{progressComment}</p>
        </DialogContent>
      </DialogBody>
      <DialogFooter>
        <FooterActions>
          <FooterActionButton styling='danger' onClick={onCancel}>
            {tx('cancel')}
          </FooterActionButton>
        </FooterActions>
      </DialogFooter>
    </Dialog>
  )
}
