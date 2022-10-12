import React, { useState, useEffect } from 'react'
import { H5, Intent } from '@blueprintjs/core'
import { SettingsButton } from './Settings'
import type { OpenDialogOptions } from 'electron'
import { ipcBackend } from '../../ipc'
import { DialogProps } from './DialogController'
import { DeltaDialogBody, DeltaDialogContent, SmallDialog } from './DeltaDialog'
import { DeltaProgressBar } from '../Login-Styles'
import { useTranslationFunction } from '../../contexts'
import { runtime } from '../../runtime'
import { getLogger } from '../../../shared/logger'
import { BackendRemote } from '../../backend-com'
import { selectedAccountId } from '../../ScreenController'
const log = getLogger('renderer/Settings/Backup')

function ExportProgressDialog(props: DialogProps) {
  const tx = useTranslationFunction()
  const [progress, setProgress] = useState(0.0)

  const onImexProgress = (_: any, [progress, _data2]: [number, any]) => {
    setProgress(progress)
  }
  useEffect(() => {
    ipcBackend.on('DC_EVENT_IMEX_PROGRESS', onImexProgress)

    return () => {
      ipcBackend.removeListener('DC_EVENT_IMEX_PROGRESS', onImexProgress)
    }
  }, [])

  return (
    <SmallDialog isOpen={props.isOpen} onClose={() => {}}>
      <DeltaDialogBody>
        <DeltaDialogContent>
          <H5 style={{ marginTop: '20px' }}>
            {tx('imex_progress_title_desktop')}
          </H5>
          <DeltaProgressBar intent={Intent.PRIMARY} progress={progress} />
        </DeltaDialogContent>
      </DeltaDialogBody>
    </SmallDialog>
  )
}

function onBackupExport() {
  const accountId = selectedAccountId()
  const tx = window.static_translate
  const openDialog = window.__openDialog

  const closeDialog = window.__closeDialog
  const userFeedback = window.__userFeedback

  openDialog('ConfirmationDialog', {
    message: tx('pref_backup_export_explain'),
    yesIsPrimary: true,
    confirmLabel: tx('ok'),
    cb: async (yes: boolean) => {
      if (!yes) {
        return
      }
      const opts: OpenDialogOptions = {
        title: tx('export_backup_desktop'),
        defaultPath: runtime.getAppPath('downloads'),
        buttonLabel: tx('save'),
        properties: ['openDirectory'],
      }
      const destination = await runtime.showOpenFileDialog(opts)
      if (!destination) {
        return
      }

      const listenForOutputFile = (
        _event: any,
        [_, filename]: [any, string]
      ) => {
        userFeedback({
          type: 'success',
          text: tx('pref_backup_written_to_x', filename),
        })
      }
      ipcBackend.once('DC_EVENT_IMEX_FILE_WRITTEN', listenForOutputFile)

      const dialog_number = openDialog(ExportProgressDialog)
      try {
        await BackendRemote.rpc.exportBackup(accountId, destination, null)
      } catch (error) {
        // TODO/QUESTION - how are errors shown to user?
        log.error('backup-export failed:', error)
      } finally {
        ipcBackend.removeListener(
          'DC_EVENT_IMEX_FILE_WRITTEN',
          listenForOutputFile
        )
        closeDialog(dialog_number)
      }
    },
  })
}

export default function SettingsBackup() {
  const tx = useTranslationFunction()
  return (
    <>
      <H5>{tx('pref_backup')}</H5>
      <SettingsButton onClick={onBackupExport}>
        {tx('export_backup_desktop')}
      </SettingsButton>
    </>
  )
}
