import React, { useCallback } from 'react'
import { dirname, basename } from 'path'

import { BackendRemote } from '../../backend-com'
import { runtime } from '@deltachat-desktop/runtime-interface'
import { selectedAccountId } from '../../ScreenController'
import SettingsButton from './SettingsButton'
import useTranslationFunction from '../../hooks/useTranslationFunction'
import useConfirmationDialog from '../../hooks/dialog/useConfirmationDialog'
import { LastUsedSlot, rememberLastUsedPath } from '../../utils/lastUsedPaths'

import { RuntimeOpenDialogOptions } from '@deltachat-desktop/shared/shared-types'
import { getLogger } from '@deltachat-desktop/shared/logger'
import { DcEventType } from '@deltachat/jsonrpc-client'
import AlertDialog from '../dialogs/AlertDialog'
import useDialog from '../../hooks/dialog/useDialog'

const log = getLogger('renderer/Settings/ManageKeys')

export default function ManageKeys() {
  const tx = useTranslationFunction()
  const openConfirmationDialog = useConfirmationDialog()
  const { openDialog } = useDialog()

  const onKeysImport = useCallback(async () => {
    const { defaultPath, setLastPath } = rememberLastUsedPath(
      LastUsedSlot.KeyImport
    )
    const opts: RuntimeOpenDialogOptions = {
      title: tx('pref_managekeys_import_secret_keys'),
      defaultPath,
      properties: ['openFile'],
      filters: [{ extensions: ['asc'], name: 'PGP Key' }],
    }

    const [filename] = await runtime.showOpenFileDialog(opts)
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

    let destination: string
    if (runtime.getRuntimeInfo().target === 'browser') {
      destination = '<BROWSER>' // gets replaced internally by browser runtime
    } else {
      const { defaultPath, setLastPath } = rememberLastUsedPath(
        LastUsedSlot.KeyExport
      )
      const opts: RuntimeOpenDialogOptions = {
        title: tx('pref_managekeys_export_secret_keys'),
        defaultPath,
        properties: ['openDirectory', 'createDirectory'],
        buttonLabel: tx('select'),
      }

      const [chosen_destination] = await runtime.showOpenFileDialog(opts)
      if (!chosen_destination) {
        return
      }
      setLastPath(chosen_destination)
      destination = chosen_destination
    }

    const title = tx(
      'pref_managekeys_export_explain',
      runtime.getRuntimeInfo().target === 'browser' ? '(download)' : destination
    )

    const confirmed = await openConfirmationDialog({
      message: title,
      confirmLabel: tx('yes'),
      cancelLabel: tx('no'),
    })

    if (confirmed) {
      const listenForOutputFiles = ({
        path,
      }: DcEventType<'ImexFileWritten'>) => {
        if (runtime.getRuntimeInfo().target === 'browser') {
          if (!basename(path).startsWith('private-key')) {
            return
          }
          const downloadLink = `/download-backup/${basename(path)}`
          // this alert dialog is to make the opening of the link a user action, to prevent the popup warning
          openDialog(AlertDialog, {
            cb: () => window.open(downloadLink, '__blank'),
            message: tx(
              'pref_managekeys_secret_keys_exported_to_x',
              downloadLink
            ),
            okBtnLabel: tx('open'),
          })
        }
      }
      const emitter = BackendRemote.getContextEvents(selectedAccountId())
      emitter.on('ImexFileWritten', listenForOutputFiles)

      try {
        await BackendRemote.rpc.exportSelfKeys(
          selectedAccountId(),
          destination,
          null
        )

        if (runtime.getRuntimeInfo().target !== 'browser') {
          window.__userFeedback({
            type: 'success',
            text: tx('pref_managekeys_secret_keys_exported_to_x', destination),
          })
        }
      } catch (error) {
        // TODO/QUESTION - how are errors shown to user?
        log.error('backup-export failed:', error)
      } finally {
        if (runtime.getRuntimeInfo().target === 'browser') {
          // event is slower than return of exportSelfKeys
          // TODO find better solution
          await new Promise(res => setTimeout(res, 1000))
        }
        emitter.off('ImexFileWritten', listenForOutputFiles)
      }
    }
  }, [tx, openConfirmationDialog])

  return (
    <>
      <SettingsButton onClick={onKeysExport}>
        {tx('pref_managekeys_export_secret_keys')}
      </SettingsButton>
      <SettingsButton onClick={onKeysImport}>
        {tx('pref_managekeys_import_secret_keys')}
      </SettingsButton>
    </>
  )
}
