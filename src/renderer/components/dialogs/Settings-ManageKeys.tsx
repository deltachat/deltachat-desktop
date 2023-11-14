import React, { useCallback } from 'react'
import { H5 } from '@blueprintjs/core'

import { SettingsButton } from './Settings'
import { runtime } from '../../runtime'
import { BackendRemote } from '../../backend-com'
import { selectedAccountId } from '../../ScreenController'
import { useTranslationFunction } from '../../hooks/useTranslationFunction'
import { useDialog } from '../../hooks/useDialog'
import ConfirmationDialog from './ConfirmationDialog'

import type { OpenDialogOptions } from 'electron'

export default function SettingsManageKeys() {
  const tx = useTranslationFunction()
  const { openDialog } = useDialog()

  const onKeysExport = useCallback(async () => {
    // TODO: ask for the user's password and check it
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
  }, [openDialog, tx])

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
