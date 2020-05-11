import React from 'react'
import { Card, Elevation, H5, Button } from '@blueprintjs/core'
import { SettingsButton } from './Settings'
import { DialogProps } from '.'
import { OpenDialogOptions, remote, ipcRenderer } from 'electron'
import { DeltaBackend } from '../../delta-remote'
import { confirmationDialogLegacy as confirmationDialog } from './ConfirmationDialog'

function onKeysImport() {
  const tx = window.translate

  const opts: OpenDialogOptions = {
    title: window.translate('pref_managekeys_import_secret_keys'),
    defaultPath: remote.app.getPath('downloads'),
    properties: ['openDirectory'],
  }

  remote.dialog.showOpenDialog(opts, (filenames: string[]) => {
    if (!filenames || !filenames.length) return

    const title = tx('pref_managekeys_import_explain', filenames[0])
    confirmationDialog(title, (response: todo) => {
      if (!response) return
      const text = tx(
        'pref_managekeys_secret_keys_imported_from_x',
        filenames[0]
      )
      ipcRenderer.on('DC_EVENT_IMEX_PROGRESS', (_event, progress) => {
        if (progress !== 1000) return
        this.props.userFeedback({ type: 'success', text })
      })
      DeltaBackend.call('settings.keysImport', filenames[0])
    })
  })
}

function onKeysExport() {
  // TODO: ask for the user's password and check it using
  // var matches = ipcRenderer.sendSync('dispatchSync', 'checkPassword', password)
  const tx = window.translate

  const opts: OpenDialogOptions = {
    title: window.translate('pref_managekeys_export_secret_keys'),
    defaultPath: remote.app.getPath('downloads'),
    properties: ['openDirectory'],
  }

  remote.dialog.showOpenDialog(opts, (filenames: string[]) => {
    if (!filenames || !filenames.length) return
    const title = tx('pref_managekeys_export_explain').replace(
      '%1$s',
      filenames[0]
    )
    confirmationDialog(title, (response: todo) => {
      if (!response || !filenames || !filenames.length) return
      ipcRenderer.once('DC_EVENT_IMEX_FILE_WRITTEN', (_event, filename) => {
        this.props.userFeedback({
          type: 'success',
          text: tx('pref_managekeys_secret_keys_exported_to_x', filename),
        })
      })

      DeltaBackend.call('settings.keysExport', filenames[0])
    })
  })
}

export default function SettingsManageKeys() {
  const tx = window.translate
  return (
    <>
      <Card elevation={Elevation.ONE}>
        <H5>{tx('pref_managekeys_menu_title')}</H5>
        <SettingsButton onClick={onKeysExport}>
          {tx('pref_managekeys_export_secret_keys')}...
        </SettingsButton>
        <SettingsButton onClick={onKeysImport}>
          {tx('pref_managekeys_import_secret_keys')}...
        </SettingsButton>
      </Card>
    </>
  )
}
