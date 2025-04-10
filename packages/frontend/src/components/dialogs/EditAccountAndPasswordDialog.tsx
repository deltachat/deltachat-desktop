import React, { useState, useEffect, useCallback } from 'react'

import { BackendRemote } from '../../backend-com'
import LoginForm, {
  Credentials,
  ConfigureProgressDialog,
  defaultCredentials,
  Proxy,
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
import { T } from '@deltachat/jsonrpc-client'

/**
 * uses a prefilled LoginForm with existing credentials
 * to edit transport & proxy settings
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
  const openConfirmationDialog = useConfirmationDialog()
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

    const proxySettings = await BackendRemote.rpc.batchGetConfig(accountId, [
      'proxy_enabled',
      'proxy_url',
    ])
    const proxy = {
      proxyEnabled: proxySettings.proxy_enabled === Proxy.ENABLED,
      proxyUrl: proxySettings.proxy_url ?? '',
    }
    setInitialAccountSettings({
      ...accountSettings,
      ...proxy,
    })
    _setAccountSettings({ ...accountSettings, ...proxy })
  }

  useEffect(() => {
    loadSettings()
  }, [])

  const onUpdate = useCallback(async () => {
    const onSuccess = () => onClose()

    const proxyUpdated =
      initialSettings.proxyEnabled !== accountSettings.proxyEnabled ||
      initialSettings.proxyUrl !== accountSettings.proxyUrl

    const update = () => {
      openDialog(ConfigureProgressDialog, {
        credentials: accountSettings,
        onSuccess,
        onFail: error => {
          openDialog(AlertDialog, { message: error })
        },
        proxyUpdated,
      })
    }

    if (initialSettings.addr !== accountSettings.addr) {
      const confirmed = await openConfirmationDialog({
        confirmLabel: tx('perm_continue'),
        isConfirmDanger: true,
        message: tx('aeap_explanation', [
          initialSettings.addr || '',
          accountSettings.addr || '',
        ]),
      })

      if (!confirmed) {
        return
      }
    } else if (accountSettings.proxyEnabled) {
      if (accountSettings.proxyUrl === null) {
        openDialog(AlertDialog, {
          message: tx('proxy_invalid') + '\n' + 'Empty Proxy Link!',
        })
        return
      }
      try {
        const qr = await BackendRemote.rpc.checkQr(
          selectedAccountId(),
          accountSettings.proxyUrl
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
    initialSettings,
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
