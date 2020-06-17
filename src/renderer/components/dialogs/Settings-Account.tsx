import { useEffect, useState } from 'react'
import { DeltaBackend } from '../../delta-remote'
import { Card, Elevation, Button, Spinner } from '@blueprintjs/core'
import React from 'react'
import LoginForm from '../LoginForm'
import DeltaChat from 'deltachat-node'
import { CloseDialogFunctionType } from './DialogController'

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
  const [accountSettings, setAccountSettings] = useState<{
    [key: string]: string
  }>(null)

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
    setAccountSettings(accountSettings)
  }

  useEffect(() => {
    loadSettings()
  }, [])

  const onLoginSubmit = (config: todo) => {
    const onDone = () => {
      ipcRenderer.removeListener(
        'DC_EVENT_CONFIGURE_PROGRESS',
        onConfigureProgress
      )
    }
    const onConfigureProgress = (_: any, [progress]: [number]) => {
      // Updating account was successfull, reload settings
      if (progress === 1000) {
        onDone()
        loadSettings()
      }
    }

    ipcRenderer.on('DC_EVENT_CONFIGURE_PROGRESS', onConfigureProgress)

    ipcRenderer.send('updateCredentials', config)
    ipcRenderer.once('DC_EVENT_CONFIGURE_FAILED', () => {
      onDone()
      onClose()
    })
  }

  // not yet implemented in core (issue #1159)
  const onCancelLogin = () => ipcRenderer.send('cancelCredentialsUpdate')

  const tx = window.translate

  return (
    <Card elevation={Elevation.ONE}>
      {/*accountSettings && (
        <Login
          {...accountSettings}
          mode='update'
          onSubmit={onLoginSubmit}
          loading={deltachat.configuring}
          onClose={onClose}
          onCancel={onCancelLogin}
          addrDisabled
        >
          <Button type='submit' text={tx('update')} />
          <Button type='reset' text={tx('cancel')} />
        </Login>
      )*/}
    </Card>
  )
}
