import React from 'react'
import { H5 } from '@blueprintjs/core'
import { SettingsButton } from './Settings'
import type { OpenDialogOptions } from 'electron'
import { runtime } from '../../runtime'
import { BackendRemote } from '../../backend-com'
import { selectedAccountId } from '../../ScreenController'
import { DcEventType } from '@deltachat/jsonrpc-client'

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
      const onImexProgress = ({ progress }: DcEventType<'ImexProgress'>) => {
        if (progress !== 1000) {
          return
        }
        window.__userFeedback({ type: 'success', text })
      }
      const emitter = BackendRemote.getContextEvents(selectedAccountId())
      emitter.on('ImexProgress', onImexProgress)
      BackendRemote.rpc
        .importSelfKeys(selectedAccountId(), filename, null)
        .finally(() => {
          emitter.off('ImexProgress', onImexProgress)
        })
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
    cb: async (yes: boolean) => {
      if (!yes || !destination) {
        return
      }
      await BackendRemote.rpc.exportSelfKeys(
        selectedAccountId(),
        destination,
        null
      )
      window.__userFeedback({
        type: 'success',
        text: tx('pref_managekeys_secret_keys_exported_to_x', destination),
      })
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
