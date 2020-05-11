import React from "react";
import { Card, Elevation, H5, Button } from "@blueprintjs/core";
import { SettingsButton } from "./Settings";
import { confirmationDialogLegacy as confirmationDialog } from './ConfirmationDialog'
import { OpenDialogOptions } from "electron";
import { ipcBackend } from '../../ipc'

const { remote } = window.electron_functions

function onBackupExport() {
    const tx = window.translate
    const userFeedback = window.__userFeedback
    const closeDialog = window.__closeDialog
    const openDialog = window.__openDialog

    const confirmOpts = {
      buttons: [
        tx('cancel'),
        tx('export_backup_desktop'),
      ],
    }
    openDialog('ConfirmationDialog', {
      message: tx('pref_backup_export_explain'),
      yesIsPrimary: true,
      confirmLabel: tx('ok'),
      cb: (yes: boolean) => {
        if(!yes) return
        const opts: OpenDialogOptions = {
          title: tx('export_backup_desktop'),
          defaultPath: remote.app.getPath('downloads'),
          properties: ['openDirectory'],
        }
        remote.dialog.showOpenDialog(opts, (filenames: string[]) => {
          if (!filenames || !filenames.length) return
          ipcBackend.once('DC_EVENT_IMEX_FILE_WRITTEN', (_event, filename) => {
            userFeedback({
              type: 'success',
              text: tx('pref_backup_written_to_x', filename),
            })

            closeDialog('ImexProgress')
          })
          ipcBackend.send('backupExport', filenames[0])
          openDialog('ImexProgress', {})
        })
      }
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