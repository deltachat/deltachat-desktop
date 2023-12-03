import React from 'react'

import { BackendRemote } from '../../backend-com'
import { runtime } from '../../runtime'
import { selectedAccountId } from '../../ScreenController'
import { useTranslationFunction } from '../../contexts'
import SettingsButton from './SettingsButton'

import type { OpenDialogOptions } from 'electron'

export default function ManageKeys() {
  const tx = useTranslationFunction()

  return (
    <>
      <SettingsButton onClick={onKeysExport}>
        {tx('pref_managekeys_export_secret_keys')}...
      </SettingsButton>
      <SettingsButton onClick={onKeysImport}>
        {tx('pref_managekeys_import_secret_keys')}...
      </SettingsButton>
    </>
  )
}

async function onKeysImport() {
  const tx = window.static_translate

  const opts: OpenDialogOptions = {
    title: tx('pref_managekeys_import_secret_keys'),
    defaultPath: runtime.getAppPath('downloads'),
    properties: ['openFile'],
    filters: [{ extensions: ['asc'], name: 'PGP Key' }],
  }

  const filename = await runtime.showOpenFileDialog(opts)
  if (!filename) {
    return
  }

  window.__openDialog('ConfirmationDialog', {
    message: tx('pref_managekeys_import_explain', filename),
    confirmLabel: tx('yes'),
    cancelLabel: tx('no'),
    cb: async (yes: boolean) => {
      if (!yes) {
        return
      }
      const text = tx('pref_managekeys_secret_keys_imported_from_x', filename)
      await BackendRemote.rpc.importSelfKeys(
        selectedAccountId(),
        filename,
        null
      )
      window.__userFeedback({ type: 'success', text })
    },
  })
}

async function onKeysExport() {
  // TODO: ask for the user's password and check it
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