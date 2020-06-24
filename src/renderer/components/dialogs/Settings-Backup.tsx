import React, { useState, useEffect } from 'react'
import { Card, Elevation, H5, Intent } from '@blueprintjs/core'
import { SettingsButton } from './Settings'
import { OpenDialogOptions } from 'electron'
import { ipcBackend } from '../../ipc'
import { DialogProps } from './DialogController'
import { DeltaDialogBody, DeltaDialogContent, SmallDialog } from './DeltaDialog'
import { DeltaProgressBar } from '../Login-Styles'
import { DeltaBackend } from '../../delta-remote'

const { remote } = window.electron_functions

function ExportProgressDialog(props: DialogProps) {
  const userFeedback = window.__userFeedback
  const tx = window.translate

  const [progress, setProgress] = useState(0.0)

  const onFileWritten = (_event: any, [_, filename]: [any, string]) => {
    userFeedback({
      type: 'success',
      text: tx('pref_backup_written_to_x', filename),
    })
    props.onClose()
  }

  const onImexProgress = (_: any, [progress, _data2]: [number, any]) => {
    setProgress(progress)
  }
  useEffect(() => {
    ipcBackend.once('DC_EVENT_IMEX_FILE_WRITTEN', onFileWritten)
    ipcBackend.on('DC_EVENT_IMEX_PROGRESS', onImexProgress)

    return () => {
      ipcBackend.removeListener('DC_EVENT_IMEX_FILE_WRITTEN', onFileWritten)
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
  const tx = window.translate
  const openDialog = window.__openDialog

  openDialog('ConfirmationDialog', {
    message: tx('pref_backup_export_explain'),
    yesIsPrimary: true,
    confirmLabel: tx('ok'),
    cb: (yes: boolean) => {
      if (!yes) return
      const opts: OpenDialogOptions = {
        title: tx('export_backup_desktop'),
        defaultPath: remote.app.getPath('downloads'),
        properties: ['openDirectory'],
      }
      remote.dialog.showOpenDialog(opts, (filenames: string[]) => {
        if (!filenames || !filenames.length) return
        openDialog(ExportProgressDialog)
        DeltaBackend.call('backup.export', filenames[0])
      })
    },
  })
}

export default function SettingsBackup() {
  const tx = window.translate
  return (
    <>
      <Card elevation={Elevation.ONE}>
        <H5>{tx('pref_backup')}</H5>
        <SettingsButton onClick={onBackupExport}>
          {tx('export_backup_desktop')}
        </SettingsButton>
      </Card>
    </>
  )
}
