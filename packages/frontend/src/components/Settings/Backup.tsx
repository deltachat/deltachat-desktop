import React, { useState, useEffect, useCallback } from 'react'
import { basename } from 'path'

import { DeltaProgressBar } from '../Login-Styles'
import { runtime } from '@deltachat-desktop/runtime-interface'
import { getLogger } from '../../../../shared/logger'
import { BackendRemote } from '../../backend-com'
import { selectedAccountId } from '../../ScreenController'
import SettingsButton from './SettingsButton'
import Dialog, {
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  FooterActionButton,
  FooterActions,
} from '../Dialog'
import useTranslationFunction from '../../hooks/useTranslationFunction'
import useDialog from '../../hooks/dialog/useDialog'
import useConfirmationDialog from '../../hooks/dialog/useConfirmationDialog'

import type { DcEventType } from '@deltachat/jsonrpc-client'
import { LastUsedSlot, rememberLastUsedPath } from '../../utils/lastUsedPaths'
import { RuntimeOpenDialogOptions } from '@deltachat-desktop/shared/shared-types'
import { DialogProps } from '../../contexts/DialogContext'
import AlertDialog from '../dialogs/AlertDialog'

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
      confirmLabel: tx('pref_backup_export_start_button'),
    })

    if (confirmed) {
      let destination: string
      if (runtime.getRuntimeInfo().target === 'browser') {
        destination = '<BROWSER>' // gets replaced internally by browser runtime
      } else {
        const { defaultPath, setLastPath } = await rememberLastUsedPath(
          LastUsedSlot.Backup
        )
        const opts: RuntimeOpenDialogOptions = {
          title: tx('export_backup_desktop'),
          defaultPath,
          buttonLabel: tx('save'),
          properties: ['openDirectory', 'createDirectory'],
        }
        const [chosen_destination] = await runtime.showOpenFileDialog(opts)
        if (!chosen_destination) {
          return
        }
        setLastPath(chosen_destination)
        destination = chosen_destination
      }

      const listenForOutputFile = ({
        path,
      }: DcEventType<'ImexFileWritten'>) => {
        if (runtime.getRuntimeInfo().target === 'browser') {
          const downloadLink = `/download-backup/${basename(path)}`
          // this alert dialog is to make the opening of the link a user action, to prevent the popup warning
          openDialog(AlertDialog, {
            cb: () => window.open(downloadLink, '__blank'),
            message: tx('pref_backup_written_to_x', downloadLink),
            okBtnLabel: tx('open'),
          })
        } else {
          userFeedback({
            type: 'success',
            text: tx('pref_backup_written_to_x', path),
          })
        }
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
        closeDialog(dialogId)
        if (runtime.getRuntimeInfo().target === 'browser') {
          // event is slower than return of exportBackup
          // TODO find better solution
          await new Promise(res => setTimeout(res, 1000))
        }
        emitter.off('ImexFileWritten', listenForOutputFile)
      }
    }
  }, [accountId, closeDialog, openConfirmationDialog, openDialog, tx])

  return (
    <SettingsButton onClick={onBackupExport}>
      {tx('export_backup_desktop')}
    </SettingsButton>
  )
}

function ExportProgressDialog({ onClose }: DialogProps) {
  const tx = useTranslationFunction()
  const [progress, setProgress] = useState(0.0)

  const onImexProgress = ({ progress }: DcEventType<'ImexProgress'>) => {
    setProgress(progress)
  }
  const accountId = selectedAccountId()

  const cancel = () => {
    BackendRemote.rpc.stopOngoingProcess(accountId).then(onClose)
  }

  useEffect(() => {
    const emitter = BackendRemote.getContextEvents(accountId)
    emitter.on('ImexProgress', onImexProgress)
    return () => {
      emitter.off('ImexProgress', onImexProgress)
    }
  }, [accountId])

  return (
    <Dialog onClose={() => {}} canOutsideClickClose={false}>
      <DialogHeader title={tx('export_backup_desktop')} />
      <DialogBody>
        <DialogContent>
          <DeltaProgressBar progress={progress} />
        </DialogContent>
        <DialogFooter>
          <FooterActions align='end'>
            <FooterActionButton onClick={cancel}>
              {tx('cancel')}
            </FooterActionButton>
          </FooterActions>
        </DialogFooter>
      </DialogBody>
    </Dialog>
  )
}
