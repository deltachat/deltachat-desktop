import React, { useState, useEffect } from 'react'

import { BackendRemote } from '../../backend-com'
import { Credentials } from '../../../shared/shared-types'
import LoginForm, {
  ConfigureProgressDialog,
  defaultCredentials,
} from '../LoginForm'
import ConfirmationDialog from '../dialogs/ConfirmationDialog'
import Dialog, {
  DialogBody,
  DialogContent,
  DialogHeader,
  OkCancelFooterAction,
} from '../Dialog'
import useTranslationFunction from '../../hooks/useTranslationFunction'
import useDialog from '../../hooks/useDialog'

import type { DialogProps } from '../../contexts/DialogContext'

export default function EditAccountAndPasswordDialog({ onClose }: DialogProps) {
  const tx = useTranslationFunction()

  return (
    <Dialog canOutsideClickClose={false} onClose={onClose}>
      <DialogHeader title={tx('pref_password_and_account_settings')} />
      {EditAccountInner(onClose)}
    </Dialog>
  )
}

function EditAccountInner(onClose: DialogProps['onClose']) {
  const [initial_settings, setInitialAccountSettings] = useState<Credentials>(
    defaultCredentials()
  )

  const [accountSettings, _setAccountSettings] = useState<Credentials>(
    defaultCredentials()
  )

  const [disableUpdate, setDisableUpdate] = useState(true)

  const setAccountSettings = (value: Credentials) => {
    disableUpdate === true && setDisableUpdate(false)
    _setAccountSettings(value)
  }

  const { openDialog } = useDialog()

  const loadSettings = async () => {
    if (window.__selectedAccountId === undefined) {
      throw new Error('can not load settings when no account is selected')
    }
    const accountSettings: Credentials = ((await BackendRemote.rpc.batchGetConfig(
      window.__selectedAccountId,
      [
        'addr',
        'mail_pw',
        'sentbox_watch',
        'mvbox_move',
        'only_fetch_mvbox',
        'e2ee_enabled',
        'mail_server',
        'mail_user',
        'mail_port',
        'mail_security',
        'imap_certificate_checks',
        'send_user',
        'send_pw',
        'send_server',
        'send_port',
        'send_security',
        'smtp_certificate_checks',
        'socks5_enabled',
        'socks5_host',
        'socks5_port',
        'socks5_user',
        'socks5_password',
      ]
    )) as unknown) as Credentials
    setInitialAccountSettings(accountSettings)
    _setAccountSettings(accountSettings)
  }

  useEffect(() => {
    loadSettings()
  }, [])

  const tx = window.static_translate

  const onUpdate = () => {
    if (disableUpdate) return
    const onSuccess = () => onClose()

    const update = () => {
      openDialog(ConfigureProgressDialog, {
        credentials: accountSettings,
        onSuccess,
      })
    }

    if (initial_settings.addr !== accountSettings.addr) {
      openDialog(ConfirmationDialog, {
        confirmLabel: tx('perm_continue'),
        isConfirmDanger: true,
        message: tx('aeap_explanation', [
          initial_settings.addr || '',
          accountSettings.addr || '',
        ]),
        cb: yes => yes && update(),
      })
    } else {
      update()
    }
  }

  if (accountSettings === null) return null
  return (
    <>
      <DialogBody>
        <DialogContent>
          {accountSettings && (
            <LoginForm
              credentials={accountSettings}
              setCredentials={setAccountSettings}
            />
          )}
        </DialogContent>
      </DialogBody>
      <OkCancelFooterAction onCancel={() => onClose()} onOk={onUpdate} />
    </>
  )
}

