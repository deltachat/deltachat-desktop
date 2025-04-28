import React, { useState, useEffect, useCallback } from 'react'

import { BackendRemote } from '../../backend-com'
import LoginForm from '../LoginForm'
import { defaultCredentials, Credentials } from '../Settings/DefaultCredentials'
import { ConfigureProgressDialog } from './ConfigureProgressDialog'
import Dialog, {
  DialogBody,
  DialogContent,
  DialogHeader,
  OkCancelFooterAction,
} from '../Dialog'
import useTranslationFunction from '../../hooks/useTranslationFunction'
import useDialog from '../../hooks/dialog/useDialog'

import type { DialogProps } from '../../contexts/DialogContext'
import AlertDialog from './AlertDialog'
import { T } from '@deltachat/jsonrpc-client'

/**
 * uses a prefilled LoginForm with existing
 * credentials to edit transport settings
 */
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
  const [initialSettings, setInitialAccountSettings] =
    useState<Credentials>(defaultCredentials())

  const [accountSettings, _setAccountSettings] =
    useState<Credentials>(defaultCredentials())

  const { openDialog } = useDialog()
  const tx = useTranslationFunction()

  const setAccountSettings = (value: Credentials) => {
    _setAccountSettings(value)
  }

  const loadSettings = async () => {
    if (window.__selectedAccountId === undefined) {
      throw new Error('can not load settings when no account is selected')
    }
    const accountId = window.__selectedAccountId
    const transports = await BackendRemote.rpc.listTransports(accountId)
    if (transports.length === 0) {
      throw new Error('no transport found')
    }
    const accountSettings: T.EnteredLoginParam = transports[0]

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

    if (initialSettings.addr !== accountSettings.addr) {
      openDialog(AlertDialog, {
        message:
          'Changing your email address is not supported right now. Check back in a few months!',
      })
      return
    }
    update()
  }, [accountSettings, initialSettings, onClose, openDialog])

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
