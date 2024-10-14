/* eslint-disable camelcase */

import { C, DcEventType } from '@deltachat/jsonrpc-client'
import React, { useEffect, useRef, useState } from 'react'
import { Collapse } from '@blueprintjs/core'
import { useDebouncedCallback } from 'use-debounce/lib'

import {
  DeltaInput,
  DeltaPasswordInput,
  DeltaSelect,
  DeltaProgressBar,
  DeltaSwitch,
} from './Login-Styles'
import { ClickableLink } from './helpers/ClickableLink'
import { Credentials } from '../types-app'
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
import { I18nContext } from '../contexts/I18nContext'
import useTranslationFunction from '../hooks/useTranslationFunction'
import { getDeviceChatId, saveLastChatId } from '../backend/chat'

import type { DialogProps } from '../contexts/DialogContext'

const log = getLogger('renderer/loginForm')

export function defaultCredentials(credentials?: Credentials): Credentials {
  const defaultCredentials: Credentials = {
    addr: '',
    mail_user: '',
    mail_pw: '',
    mail_server: '',
    mail_port: '',
    mail_security: '',
    imap_certificate_checks: '',
    send_user: '',
    send_pw: '',
    send_server: '',
    send_port: '',
    send_security: '',
    smtp_certificate_checks: '',
    proxy_enabled: '0',
    proxy_url: '',
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

  const _handleCredentialsChange = (id: string, value: string) => {
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

  const handleCredentialsChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { id, value } = event.target
    _handleCredentialsChange(id, value)
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
    proxy_enabled,
    proxy_url,
  } = credentials

  // We assume that smtp_certificate_checks has the same value.
  const certificate_checks = imap_certificate_checks

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
            key='mail_pw'
            id='mail_pw'
            placeholder={tx('existing_password')}
            password={mail_pw || ''}
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
              placeholder={tx('def')}
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
              password={send_pw || ''}
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
              placeholder={tx('def')}
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
            <DeltaSwitch
              id='proxy_enabled'
              label={tx('proxy_use_proxy')}
              value={proxy_enabled}
              onChange={isTrue =>
                _handleCredentialsChange('proxy_enabled', isTrue ? '1' : '0')
              }
            />
            {proxy_enabled === '1' && (
              <>
                <p className='text'>
                  Proxy support is currently experimental. Please use at your
                  own risk. If you type in an address in the e-mail field, there
                  there will be DNS lookup that won't get tunneled through
                  proxy.
                </p>
                <p className='text'>{tx('proxy_add_explain')}</p>
                <DeltaInput
                  key='proxy_url'
                  id='proxy_url'
                  label={tx('proxy_add_url_hint')}
                  value={proxy_url}
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
  credentials?: Partial<Credentials>
  onSuccess?: () => void
  onUserCancellation?: () => void
  onFail: (error: string) => void
}

export function ConfigureProgressDialog({
  credentials = {},
  onSuccess,
  onUserCancellation,
  onFail,
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
          const initialConfig: { [key: string]: string } = {
            ...credentials,
            verified_one_on_one_chats: '1',
          }
          await BackendRemote.rpc.batchSetConfig(accountId, initialConfig)

          // Configure user account _after_ setting the credentials
          await BackendRemote.rpc.configure(accountId)
          if (wasCanceled.current) {
            onClose()
            onUserCancellation?.()
            return
          }

          // Select "Device Messages" chat as the initial one. This will serve
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
          <FooterActionButton danger onClick={onCancel}>
            {tx('cancel')}
          </FooterActionButton>
        </FooterActions>
      </DialogFooter>
    </Dialog>
  )
}
