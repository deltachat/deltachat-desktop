import React, { useCallback } from 'react'

import { BackendRemote } from '../../backend-com'
import { runtime } from '../../runtime'
import { selectedAccountId } from '../../ScreenController'
import SettingsButton from './SettingsButton'
import useTranslationFunction from '../../hooks/useTranslationFunction'
import useConfirmationDialog from '../../hooks/useConfirmationDialog'

import type { OpenDialogOptions } from 'electron'
import {
  LastUsedSlot,
  rememberLastUsedPath,
} from '../../utils/cachedLastUsedPath'
import { dirname } from 'path'

export default function ManageKeys() {
  const tx = useTranslationFunction()
  const openConfirmationDialog = useConfirmationDialog()

  const onKeysImport = useCallback(async () => {
    const { defaultPath, setLastPath } = rememberLastUsedPath(
      LastUsedSlot.KeyImport
    )
    const opts: OpenDialogOptions = {
      title: tx('pref_managekeys_import_secret_keys'),
      defaultPath,
      properties: ['openFile'],
      filters: [{ extensions: ['asc'], name: 'PGP Key' }],
    }

    const filename = await runtime.showOpenFileDialog(opts)
    if (!filename) {
      return
    }
    setLastPath(dirname(filename))

    const confirmed = await openConfirmationDialog({
      message: tx('pref_managekeys_import_explain', filename),
      confirmLabel: tx('yes'),
      cancelLabel: tx('no'),
    })

    if (confirmed) {
      const text = tx('pref_managekeys_secret_keys_imported_from_x', filename)

      await BackendRemote.rpc.importSelfKeys(
        selectedAccountId(),
        filename,
        null
      )

      window.__userFeedback({ type: 'success', text })
    }
  }, [openConfirmationDialog, tx])

  const onKeysExport = useCallback(async () => {
    // TODO: ask for the user's password and check it

    const { defaultPath, setLastPath } = rememberLastUsedPath(
      LastUsedSlot.KeyExport
    )
    const opts: OpenDialogOptions = {
      title: tx('pref_managekeys_export_secret_keys'),
      defaultPath,
      properties: ['openDirectory', 'createDirectory'],
    }

    const destination = await runtime.showOpenFileDialog(opts)
    if (!destination) {
      return
    }
    setLastPath(destination)

    const title = tx('pref_managekeys_export_explain').replace(
      '%1$s',
      destination
    )

    const confirmed = await openConfirmationDialog({
      message: title,
      confirmLabel: tx('yes'),
      cancelLabel: tx('no'),
    })

    if (confirmed) {
      await BackendRemote.rpc.exportSelfKeys(
        selectedAccountId(),
        destination,
        null
      )

      window.__userFeedback({
        type: 'success',
        text: tx('pref_managekeys_secret_keys_exported_to_x', destination),
      })
    }
  }, [tx, openConfirmationDialog])

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
