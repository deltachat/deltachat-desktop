import { useEffect, useState, useContext } from 'react'
import { DeltaBackend } from '../../delta-remote'
import { Card, Elevation, Button, Spinner } from '@blueprintjs/core'
import React from 'react'
import LoginForm, { ConfigureProgressDialog } from '../LoginForm'
import DeltaChat from 'deltachat-node'
import { CloseDialogFunctionType } from './DialogController'
import { DeltaDialogBody, DeltaDialogFooter } from './DeltaDialog'
import { ScreenContext } from '../../contexts'
import { Screens } from '../../ScreenController'
import classNames from 'classnames'

const { ipcRenderer } = window.electron_functions

export default function SettingsAccount({
  deltachat,
  show,
  setShow,
  onClose,
}: {
  deltachat: any
  show: string
  setShow: (show: string) => void
  onClose: any
}) {
  const [initialAccountSettings, setInitialAccountSettings] = useState<{
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
  const tx = window.translate

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
      <DeltaDialogFooter
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginTop: '0px',
          padding: '7px 13px 10px 13px',
        }}
      >
        <p
          className={classNames('delta-button primary bold', {
            disabled: disableUpdate,
          })}
          onClick={onUpdate}
          style={{ marginLeft: 'auto' }}
        >
          {tx('update')}
        </p>
      </DeltaDialogFooter>
    </>
  )
}
