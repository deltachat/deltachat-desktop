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
import SettingsStoreInstance, { useSettingsStore } from '../../stores/settings'
import { getLogger } from '@deltachat-desktop/shared/logger'

type AccountAndPasswordDialogProps = DialogProps & {
  /** Address of the transport to edit. */
  addr: string
}

const log = getLogger('renderer/EditAccountAndPasswordDialog')

/**
 * uses a prefilled LoginForm with existing
 * credentials to edit transport settings
 */
export default function EditAccountAndPasswordDialog({
  onClose,
  addr,
}: AccountAndPasswordDialogProps) {
  const tx = useTranslationFunction()

  const settingsStore = useSettingsStore()[0]
  const forceEncryption = settingsStore?.settings.force_encryption !== '0'

  return (
    <Dialog canOutsideClickClose={false} onClose={onClose}>
      <DialogHeader
        title={
          // forceEncryption is false if account is not
          // configured yet or the setting is set to false
          forceEncryption
            ? tx('edit_transport')
            : tx('manual_account_setup_option')
        }
      />
      <EditAccountInner {...{ onClose, addr }} />
    </Dialog>
  )
}

function EditAccountInner({
  onClose,
  addr,
}: {
  onClose: DialogProps['onClose']
  addr: string
}) {
  const settingsStore = useSettingsStore()[0]
  const [initialTransportSettings, setInitialTransportSettings] =
    useState<Credentials>(defaultCredentials())

  const [transportSettings, setTransportSettings] =
    useState<Credentials>(defaultCredentials())
  const [forceEncryption, setForceEncryption] = useState<boolean>(
    settingsStore?.settings['force_encryption'] === '1'
  )

  const { openDialog } = useDialog()
  const tx = useTranslationFunction()

  useEffect(() => {
    let cancelled = false

    const loadSettings = async () => {
      if (window.__selectedAccountId === undefined) {
        throw new Error('can not load settings when no account is selected')
      }
      const accountId = window.__selectedAccountId
      const transports = await BackendRemote.rpc.listTransports(accountId)
      if (cancelled) return
      if (transports.length === 0) {
        throw new Error('no transport found')
      }
      const transportSettings: T.EnteredLoginParam | undefined =
        transports.find(t => t.addr === addr)

      if (!transportSettings) {
        throw new Error('transport to edit not found in transport list')
      }

      setInitialTransportSettings(transportSettings)
      setTransportSettings(transportSettings)
    }

    loadSettings().catch(error => {
      log.error('Failed to load settings:', error)
    })

    return () => {
      cancelled = true
    }
  }, [addr])

  const onUpdate = useCallback(async () => {
    const onSuccess = async () => {
      const forceEncryptionValue = forceEncryption ? '1' : '0'
      if (
        settingsStore?.settings['force_encryption'] !== forceEncryptionValue
      ) {
        await SettingsStoreInstance.effect.setCoreSetting(
          'force_encryption',
          forceEncryptionValue
        )
      }
      onClose()
    }

    const update = () => {
      openDialog(ConfigureProgressDialog, {
        credentials: transportSettings,
        onSuccess,
        onFail: error => {
          openDialog(AlertDialog, { message: error })
        },
      })
    }

    if (initialTransportSettings.addr !== transportSettings.addr) {
      log.error('changing email addres of transport is not allowed')
      return
    }

    update()
  }, [
    transportSettings,
    forceEncryption,
    initialTransportSettings,
    onClose,
    openDialog,
    settingsStore,
  ])

  const onOk = useCallback(async () => {
    await onUpdate()
  }, [onUpdate])

  if (transportSettings === null) return null
  return (
    <>
      <DialogBody>
        <DialogContent>
          {transportSettings && (
            <LoginForm
              credentials={transportSettings}
              setCredentials={setTransportSettings}
              forceEncryption={forceEncryption}
              setForceEncryption={setForceEncryption}
              isEdit
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
