import React, { useState, useEffect, useCallback } from 'react'

import { BackendRemote } from '../../backend-com'
import { Credentials } from '../../types-app'
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
import { selectedAccountId } from '../../ScreenController'

export default function EditAccountAndPasswordDialog({ onClose }: DialogProps) {
  const tx = useTranslationFunction()

  return (
    <Dialog canOutsideClickClose={false} onClose={onClose}>
      <DialogHeader title={tx('login_header')} />
      {EditAccountInner(onClose)}
    </Dialog>
  )
}

function EditAccountInner(onClose: DialogProps['onClose']) {
  const [initial_settings, setInitialAccountSettings] =
    useState<Credentials>(defaultCredentials())

  const [accountSettings, _setAccountSettings] =
    useState<Credentials>(defaultCredentials())

  const { openDialog } = useDialog()
  const openConfirmationDialog = useConfirmationDialog()
  const tx = useTranslationFunction()

  const setAccountSettings = (value: Credentials) => {
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
        'proxy_enabled',
        'proxy_url',
      ])) as unknown as Credentials
    setInitialAccountSettings(accountSettings)
    _setAccountSettings(accountSettings)
  }

  useEffect(() => {
    loadSettings()
  }, [])

  const onUpdate = useCallback(async () => {
    const onSuccess = () => onClose()

    const update = () => {
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

      if (!confirmed) {
        return
      }
    } else if (
      initial_settings.proxy_enabled !== accountSettings.proxy_enabled &&
      accountSettings.proxy_enabled === '1'
    ) {
      try {
        const qr = await BackendRemote.rpc.checkQr(
          selectedAccountId(),
          accountSettings.proxy_url
        )
        if (qr.kind !== 'proxy') {
          openDialog(AlertDialog, {
            message: tx('proxy_invalid'),
          })
          return
        }
      } catch (error) {
        const errorStr =
          error instanceof Error ? error.message : JSON.stringify(error)
        openDialog(AlertDialog, {
          message: tx('proxy_invalid') + '\n' + errorStr,
        })
        return
      }
    }
    update()
  }, [
    accountSettings,
    initial_settings.addr,
    initial_settings.proxy_enabled,
    onClose,
    openConfirmationDialog,
    openDialog,
    tx,
  ])

  const onOk = useCallback(async () => {
    await onUpdate()
  }, [onUpdate])

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
      <OkCancelFooterAction
        onCancel={() => onClose()}
        onOk={onOk}
        confirmLabel={tx('login_title')}
      />
    </>
  )
}
