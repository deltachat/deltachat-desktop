import React, { useCallback } from 'react'

import { BackendRemote } from '../../backend-com'
import { runtime } from '../../runtime'
import { selectedAccountId } from '../../ScreenController'
import SettingsButton from './SettingsButton'
import ConfirmationDialog from '../dialogs/ConfirmationDialog'
import useTranslationFunction from '../../hooks/useTranslationFunction'
import useDialog from '../../hooks/useDialog'

import type { OpenDialogOptions } from 'electron'

export default function ManageKeys() {
  const tx = useTranslationFunction()
  const { openDialog } = useDialog()

  const onKeysImport = useCallback(async () => {
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

    openDialog(ConfirmationDialog, {
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
  }, [openDialog, tx])

  const onKeysExport = useCallback(async () => {
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

    openDialog(ConfirmationDialog, {
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
  }, [openDialog])

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
