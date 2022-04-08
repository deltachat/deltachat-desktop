import React from 'react'
import { H5 } from '@blueprintjs/core'
import { SettingsButton } from './Settings'
import type { OpenDialogOptions } from 'electron'
import { DeltaBackend } from '../../delta-remote'
import { ipcBackend } from '../../ipc'
import { runtime } from '../../runtime'

async function onKeysImport() {
  const tx = window.static_translate

  const opts: OpenDialogOptions = {
    title: tx('pref_managekeys_import_secret_keys'),
    defaultPath: runtime.getAppPath('downloads'),
    properties: ['openDirectory'],
  }

  const filename = await runtime.showOpenFileDialog(opts)
  if (!filename) {
    return
  }

  window.__openDialog('ConfirmationDialog', {
    message: tx('pref_managekeys_import_explain', filename),
    confirmLabel: tx('yes'),
    cancelLabel: tx('no'),
    cb: (yes: boolean) => {
      if (!yes) {
        return
      }
      const text = tx('pref_managekeys_secret_keys_imported_from_x', filename)
      ipcBackend.on('DC_EVENT_IMEX_PROGRESS', (_event, progress) => {
        if (progress !== 1000) {
          return
        }
        window.__userFeedback({ type: 'success', text })
      })
      DeltaBackend.call('settings.keysImport', filename)
    },
  })
}

async function onKeysExport() {
  // TODO: ask for the user's password and check it using
  // var matches = ipcRenderer.sendSync('dispatchSync', 'checkPassword', password)
  const tx = window.static_translate

  const opts: OpenDialogOptions = {
    title: tx('pref_managekeys_export_secret_keys'),
    defaultPath: runtime.getAppPath('downloads'),
    properties: ['openDirectory'],
  }

  const destination = await runtime.showOpenFileDialog(opts)
  if (!destination) {
    return
  }
  const title = tx('pref_managekeys_export_explain').replace(
    '%1$s',
    destination
  )
  window.__openDialog('ConfirmationDialog', {
    message: title,
    confirmLabel: tx('yes'),
    cancelLabel: tx('no'),
    cb: (yes: boolean) => {
      if (!yes || !destination) {
        return
      }
      ipcBackend.once('DC_EVENT_IMEX_FILE_WRITTEN', (_event, filename) => {
        window.__userFeedback({
          type: 'success',
          text: tx('pref_managekeys_secret_keys_exported_to_x', filename),
        })
      })
      DeltaBackend.call('settings.keysExport', destination)
    },
  })
}

export default function SettingsManageKeys() {
  const tx = window.static_translate
  return (
    <>
      <H5>{tx('pref_managekeys_menu_title')}</H5>
      <SettingsButton onClick={onKeysExport}>
        {tx('pref_managekeys_export_secret_keys')}...
      </SettingsButton>
      <SettingsButton onClick={onKeysImport}>
        {tx('pref_managekeys_import_secret_keys')}...
      </SettingsButton>
    </>
  )
}
