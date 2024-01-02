import { Intent } from '@blueprintjs/core'
import React, { useCallback, useEffect, useState } from 'react'

import SettingsButton from './SettingsButton'
import { getLogger } from '../../../shared/logger'
import { BackendRemote } from '../../backend-com'
import useConfirmationDialog from '../../hooks/useConfirmationDialog'
import useDialog from '../../hooks/useDialog'
import useTranslationFunction from '../../hooks/useTranslationFunction'
import { runtime } from '../../runtime'
import { selectedAccountId } from '../../ScreenController'
import Dialog, { DialogBody, DialogContent, DialogHeader } from '../Dialog'
import { DeltaProgressBar } from '../Login-Styles'

import type { DcEventType } from '@deltachat/jsonrpc-client'
import type { OpenDialogOptions } from 'electron'

const log = getLogger('renderer/Settings/Backup')

export default function Backup() {
  const tx = useTranslationFunction()
  const accountId = selectedAccountId()
  const { openDialog, closeDialog } = useDialog()
  const openConfirmationDialog = useConfirmationDialog()

  const onBackupExport = useCallback(async () => {
    const userFeedback = window.__userFeedback

    const confirmed = await openConfirmationDialog({
      message: tx('pref_backup_export_explain'),
      confirmLabel: tx('ok'),
    })

    if (confirmed) {
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

      const dialogId = openDialog(ExportProgressDialog)
      try {
        await BackendRemote.rpc.exportBackup(accountId, destination, null)
      } catch (error) {
        // TODO/QUESTION - how are errors shown to user?
        log.error('backup-export failed:', error)
      } finally {
        emitter.off('ImexFileWritten', listenForOutputFile)
        closeDialog(dialogId)
      }
    }
  }, [accountId, closeDialog, openConfirmationDialog, openDialog, tx])

  return (
    <SettingsButton onClick={onBackupExport}>
      {tx('export_backup_desktop')}
    </SettingsButton>
  )
}

function ExportProgressDialog() {
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
    <Dialog onClose={() => {}}>
      <DialogHeader title={tx('export_backup_desktop')} />
      <DialogBody>
        <DialogContent>
          <DeltaProgressBar intent={Intent.PRIMARY} progress={progress} />
        </DialogContent>
      </DialogBody>
    </Dialog>
  )
}
