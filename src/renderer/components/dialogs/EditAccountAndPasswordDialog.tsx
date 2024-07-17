import React, { useState, useEffect, useCallback } from 'react'

import { BackendRemote } from '../../backend-com'
import { Credentials } from '../../../shared/shared-types'
import LoginForm, {
  ConfigureProgressDialog,
  defaultCredentials,
} from '../LoginForm'
import Dialog, {
  DialogBody,
  DialogContent,
  DialogHeader,
  OkCancelFooterAction,
} from '../Dialog'
import useTranslationFunction from '../../hooks/useTranslationFunction'
import useDialog from '../../hooks/dialog/useDialog'
import useConfirmationDialog from '../../hooks/dialog/useConfirmationDialog'

import type { DialogProps } from '../../contexts/DialogContext'
import AlertDialog from './AlertDialog'

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
  const [initial_settings, setInitialAccountSettings] =
    useState<Credentials>(defaultCredentials())

  const [accountSettings, _setAccountSettings] =
    useState<Credentials>(defaultCredentials())

  const [userNeverChangedAccountSettings, setUserNeverChangedAccountSettings] =
    useState(true)
  const [
    userNeverAppliedNewAccountSettings,
    setUserNeverAppliedNewAccountSettings,
  ] = useState(true)

  const { openDialog } = useDialog()
  const openConfirmationDialog = useConfirmationDialog()
  const tx = useTranslationFunction()

  const setAccountSettings = (value: Credentials) => {
    userNeverChangedAccountSettings === true &&
      setUserNeverChangedAccountSettings(false)
    _setAccountSettings(value)
  }

  const loadSettings = async () => {
    if (window.__selectedAccountId === undefined) {
      throw new Error('can not load settings when no account is selected')
    }
    const accountSettings: Credentials =
      (await BackendRemote.rpc.batchGetConfig(window.__selectedAccountId, [
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
      ])) as unknown as Credentials
    setInitialAccountSettings(accountSettings)
    _setAccountSettings(accountSettings)
  }

  useEffect(() => {
    loadSettings()
  }, [])

  const onUpdate = useCallback(async () => {
    if (userNeverChangedAccountSettings) return true
    const onSuccess = () => onClose()

    const update = () => {
      setUserNeverAppliedNewAccountSettings(false)
      openDialog(ConfigureProgressDialog, {
        credentials: accountSettings,
        onSuccess,
        onFail: error => {
          openDialog(AlertDialog, { message: error })
        },
      })
    }

    if (initial_settings.addr !== accountSettings.addr) {
      const confirmed = await openConfirmationDialog({
        confirmLabel: tx('perm_continue'),
        isConfirmDanger: true,
        message: tx('aeap_explanation', [
          initial_settings.addr || '',
          accountSettings.addr || '',
        ]),
      })

      if (confirmed) {
        update()
      }
    } else {
      update()
    }
  }, [
    accountSettings,
    userNeverChangedAccountSettings,
    initial_settings.addr,
    onClose,
    openConfirmationDialog,
    openDialog,
    tx,
  ])

  const onOk = useCallback(async () => {
    const update = await onUpdate()
    if (update) onClose()
  }, [onClose, onUpdate])

  const onCacnel = () => {
    if (userNeverAppliedNewAccountSettings) {
      onClose()
      return
    }
    // This for the case when the user edited credentials, pressed "OK",
    // and then we failed to confugure account (see `ConfigureProgressDialog`),
    // (which would result in `EditAccountAndPasswordDialog`
    // not getting closed).
    // In this case, "cancel" should revert back to the credentials that were
    // set when the dialog was first opened.
    //
    // Yes, simply doing
    // `await BackendRemote.rpc.batchSetConfig(accountId, initial_settings)`
    // is also an option, but let's show the user that the original
    // credentials are also not good, if that is the case.
    //
    // And yes, simply closing Delta Chat without pressing "Cancel",
    // or the user closing the dialog wiht "Esc"
    // would result this code not gettings invoked, and therefore
    // original credentials not getting restored...
    openDialog(ConfigureProgressDialog, {
      credentials: initial_settings, // Yes, `initial_settings`.
      onSuccess: () => {},
      onFail: error => {
        // This shouldn't happen often, because
        // we simply returned to original settings.
        // But it could, if, for example, the credentials
        // were changed on the server,
        // and the user never entered the correct credentials.
        openDialog(AlertDialog, { message: error })
      },
    })
    // Close the dialog immediately, no matter the result of the
    // `ConfigureProgressDialog`.
    onClose()
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
      <OkCancelFooterAction onCancel={onCacnel} onOk={onOk} />
    </>
  )
}
