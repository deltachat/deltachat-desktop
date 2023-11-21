import React, { useState, useEffect, useCallback } from 'react'
import { DcEventType } from '@deltachat/jsonrpc-client'
import { H5, Intent } from '@blueprintjs/core'

import { SettingsButton } from './Settings'
import { DeltaDialogBody, DeltaDialogContent, SmallDialog } from './DeltaDialog'
import { DeltaProgressBar } from '../Login-Styles'
import { runtime } from '../../runtime'
import { getLogger } from '../../../shared/logger'
import { BackendRemote } from '../../backend-com'
import { selectedAccountId } from '../../ScreenController'
import { useTranslationFunction } from '../../hooks/useTranslationFunction'
import { useDialog } from '../../hooks/useDialog'
import ConfirmationDialog from './ConfirmationDialog'

import type { OpenDialogOptions } from 'electron'

const log = getLogger('renderer/Settings/Backup')

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
    <SmallDialog onClose={() => {}}>
      <DeltaDialogBody>
        <DeltaDialogContent>
          <H5 style={{ marginTop: '20px' }}>{tx('export_backup_desktop')}</H5>
          <DeltaProgressBar intent={Intent.PRIMARY} progress={progress} />
        </DeltaDialogContent>
      </DeltaDialogBody>
    </SmallDialog>
  )
}

export default function SettingsBackup() {
  const tx = useTranslationFunction()
  const accountId = selectedAccountId()
  const { openDialog, closeDialog } = useDialog()

  const onBackupExport = useCallback(() => {
    const userFeedback = window.__userFeedback

    openDialog(ConfirmationDialog, {
      message: tx('pref_backup_export_explain'),
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
  }, [accountId, closeDialog, openDialog, tx])

  return (
    <>
      <H5>{tx('pref_backup')}</H5>
      <SettingsButton onClick={onBackupExport}>
        {tx('export_backup_desktop')}
      </SettingsButton>
    </>
  )
}
