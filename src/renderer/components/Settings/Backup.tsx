import React, { useState, useEffect } from 'react'
import { H5, Intent } from '@blueprintjs/core'
import { DcEventType } from '@deltachat/jsonrpc-client'

import { DialogProps } from '../dialogs/DialogController'
import { DeltaProgressBar } from '../Login-Styles'
import { useTranslationFunction } from '../../contexts'
import { runtime } from '../../runtime'
import { getLogger } from '../../../shared/logger'
import { BackendRemote } from '../../backend-com'
import { selectedAccountId } from '../../ScreenController'
import SettingsButton from './SettingsButton'
import { DialogBody } from '../Dialog'
import SmallDialog from '../SmallDialog'

import type { OpenDialogOptions } from 'electron'

const log = getLogger('renderer/Settings/Backup')

export default function Backup() {
  const tx = useTranslationFunction()

  return (
    <SettingsButton onClick={onBackupExport}>
      {tx('export_backup_desktop')}
    </SettingsButton>
  )
}

function ExportProgressDialog(props: DialogProps) {
  const tx = useTranslationFunction()
  const [progress, setProgress] = useState(0.0)

  const onImexProgress = ({ progress }: DcEventType<'ImexProgress'>) => {
    setProgress(progress)
  }
  const accountId = selectedAccountId()
  useEffect(() => {
    const emitter = BackendRemote.getContextEvents(accountId)
    emitter.on('ImexProgress', onImexProgress)
    return () => {
      emitter.off('ImexProgress', onImexProgress)
    }
  }, [accountId])

  return (
    <SmallDialog isOpen={props.isOpen} onClose={() => {}}>
      <DialogBody>
        <H5 style={{ marginTop: '20px' }}>{tx('export_backup_desktop')}</H5>
        <DeltaProgressBar intent={Intent.PRIMARY} progress={progress} />
      </DialogBody>
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

      const listenForOutputFile = ({
        path: filename,
      }: DcEventType<'ImexFileWritten'>) => {
        userFeedback({
          type: 'success',
          text: tx('pref_backup_written_to_x', filename),
        })
      }
      const emitter = BackendRemote.getContextEvents(selectedAccountId())
      emitter.once('ImexFileWritten', listenForOutputFile)

      const dialog_number = openDialog(ExportProgressDialog)
      try {
        await BackendRemote.rpc.exportBackup(accountId, destination, null)
      } catch (error) {
        // TODO/QUESTION - how are errors shown to user?
        log.error('backup-export failed:', error)
      } finally {
        emitter.off('ImexFileWritten', listenForOutputFile)
        closeDialog(dialog_number)
      }
    },
  })
}
