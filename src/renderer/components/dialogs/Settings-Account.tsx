import { useEffect, useState, useContext } from 'react'
import { DeltaBackend } from '../../delta-remote'
import { Card, Elevation } from '@blueprintjs/core'
import React from 'react'
import LoginForm, {
  ConfigureProgressDialog,
  defaultCredentials,
} from '../LoginForm'

import {
  DeltaDialogBody,
  DeltaDialogOkCancelFooter,
  DeltaDialogBase,
  DeltaDialogHeader,
} from './DeltaDialog'
import { ScreenContext, useTranslationFunction } from '../../contexts'
import { Credentials } from '../../../shared/shared-types'
import { DialogProps } from './DialogController'
import ConfirmationDialog from './ConfirmationDialog'

export default function SettingsAccountDialog({
  isOpen,
  onClose,
}: {
  isOpen: DialogProps['isOpen']
  onClose: DialogProps['onClose']
}) {
  const tx = useTranslationFunction()
  return (
    <DeltaDialogBase
      onClose={onClose}
      isOpen={isOpen}
      canOutsideClickClose={false}
      style={{
        maxHeight: 'calc(100% - 100px)',
        width: '500px',
      }}
    >
      <DeltaDialogHeader title={tx('pref_password_and_account_settings')} />
      {SettingsAccountInner(onClose)}
    </DeltaDialogBase>
  )
}

export function SettingsAccountInner(onClose: () => void) {
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

  const { openDialog } = useContext(ScreenContext)

  const loadSettings = async () => {
    const accountSettings: Credentials = ((await DeltaBackend.call(
      'settings.getConfigFor',
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
      <DeltaDialogBody noFooter>
        <Card elevation={Elevation.ONE}>
          {accountSettings && (
            <LoginForm
              credentials={accountSettings}
              setCredentials={setAccountSettings}
            />
          )}
        </Card>
      </DeltaDialogBody>
      <DeltaDialogOkCancelFooter onCancel={() => onClose()} onOk={onUpdate} />
    </>
  )
}
