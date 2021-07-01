import { useEffect, useState, useContext } from 'react'
import { DeltaBackend } from '../../delta-remote'
import { Card, Elevation } from '@blueprintjs/core'
import React from 'react'
import LoginForm, { ConfigureProgressDialog } from '../LoginForm'

import { DeltaDialogBody, DeltaDialogOkCancelFooter } from './DeltaDialog'
import { ScreenContext, useTranslationFunction } from '../../contexts'

export default function SettingsAccount({
  setShow,
}: {
  show: string
  setShow: (show: string) => void
  onClose: any
}) {
  const [, setInitialAccountSettings] = useState<{
    [key: string]: string
  }>(null)

  const [accountSettings, _setAccountSettings] = useState<{
    [key: string]: string
  }>(null)

  const [disableUpdate, setDisableUpdate] = useState(true)

  const setAccountSettings = (
    value: React.SetStateAction<{
      [key: string]: string
    }>
  ) => {
    disableUpdate === true && setDisableUpdate(false)
    _setAccountSettings(value)
  }

  const { openDialog, userFeedback } = useContext(ScreenContext)
  const tx = useTranslationFunction()

  const loadSettings = async () => {
    const accountSettings = await DeltaBackend.call('settings.getConfigFor', [
      'addr',
      'mail_pw',
      'inbox_watch',
      'sentbox_watch',
      'mvbox_watch',
      'mvbox_move',
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
      'socks5_password'
    ])
    setInitialAccountSettings(accountSettings)
    _setAccountSettings(accountSettings)
  }

  useEffect(() => {
    loadSettings()
  }, [])

  const onUpdate = () => {
    if (disableUpdate) return
    const onSuccess = () => userFeedback({ type: 'success', text: tx('ok') })
    openDialog(ConfigureProgressDialog, {
      credentials: accountSettings,
      onSuccess,
      mode: 'update',
    })
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
              addrDisabled
            />
          )}
        </Card>
      </DeltaDialogBody>
      <DeltaDialogOkCancelFooter
        onCancel={() => setShow('main')}
        onOk={onUpdate}
      />
    </>
  )
}
