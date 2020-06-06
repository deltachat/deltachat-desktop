import React, { useState, useEffect } from 'react'
import { Card, Elevation, H5, Classes, ProgressBar, Intent } from '@blueprintjs/core'
import { SettingsButton } from './Settings'
import { OpenDialogOptions, } from 'electron'
import { ipcBackend } from '../../ipc'
import { DialogProps } from './DialogController'
import DeltaDialog from './DeltaDialog'
import { isOpen } from '@blueprintjs/core/lib/esm/components/context-menu/contextMenu'

const { remote } = window.electron_functions

function ExportProgressDialog(props: DialogProps) {

  const userFeedback = window.__userFeedback

  const [progress, setProgress] = useState(0)

  const onFileWritten = (_event: any, [_, filename] : [any, string]) => {
      userFeedback({
        type: 'success',
        text: tx('pref_backup_written_to_x', filename),
      })
      props.onClose()

  }

  const onImexProgress = (_ : any, progress : number) => setProgress(progress)
  useEffect(() => {
    ipcBackend.once('DC_EVENT_IMEX_FILE_WRITTEN', onFileWritten)
    ipcBackend.on('DC_EVENT_IMEX_PROGRESS', onImexProgress)

    return () => {
      ipcBackend.removeListener('DC_EVENT_IMEX_FILE_WRITTEN', onFileWritten)
      ipcBackend.removeListener('DC_EVENT_IMEX_PROGRESS', onImexProgress)
    }
  }, [])


  return (
    <DeltaDialog
      isOpen={props.isOpen}
      title={tx('imex_progress_title_desktop')}
      canEscapeKeyClose={false}
      isCloseButtonShown={false}
      onClose={() => {}}
      canOutsideClickClose={false}
    >
      <div className={Classes.DIALOG_BODY}>
        <ProgressBar
          intent={Intent.PRIMARY}
          value={isOpen ? progress / 1000 : null}
        />
      </div>
    </DeltaDialog>
  )
}

function onBackupExport() {
  const tx = window.translate
  const userFeedback = window.__userFeedback
  const closeDialog = window.__closeDialog
  const openDialog = window.__openDialog

  const confirmOpts = {
    buttons: [tx('cancel'), tx('export_backup_desktop')],
  }
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
        ipcBackend.send('backupExport', filenames[0])
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
          {tx('pref_backup_export_start_button')}
        </SettingsButton>
      </Card>
    </>
  )
}
