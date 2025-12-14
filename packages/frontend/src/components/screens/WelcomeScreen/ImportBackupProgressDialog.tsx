import React, { useEffect, useState } from 'react'

import useTranslationFunction from '../../../hooks/useTranslationFunction'
import { BackendRemote } from '../../../backend-com'
import { DeltaProgressBar } from '../../Login-Styles'
import {
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogWithHeader,
  FooterActionButton,
  FooterActions,
} from '../../Dialog'
import { getLogger } from '../../../../../shared/logger'
import { selectedAccountId } from '../../../ScreenController'

import type { DcEventType } from '@deltachat/jsonrpc-client'
import type { DialogProps } from '../../../contexts/DialogContext'
import { unknownErrorToString } from '../../helpers/unknownErrorToString'

type Props = {
  backupFile: string
}

const log = getLogger('renderer/components/ImportBackupProgressDialog')

export default function ImportBackupProgressDialog({
  onClose,
  backupFile,
}: Props & DialogProps) {
  const [importProgress, setImportProgress] = useState(0.0)
  const [error, setError] = useState<string | null>(null)

  const onImexProgress = ({ progress }: DcEventType<'ImexProgress'>) => {
    setImportProgress(progress)
  }

  const accountId = selectedAccountId()

  const cancel = () => {
    BackendRemote.rpc.stopOngoingProcess(accountId).then(onClose)
  }

  useEffect(() => {
    ;(async () => {
      try {
        log.debug(`Starting backup import of ${backupFile}`)
        await BackendRemote.rpc.importBackup(accountId, backupFile, null)
      } catch (err) {
        setError(unknownErrorToString(err))
        return
      }
      onClose()
      window.__selectAccount(accountId)
    })()

    const emitter = BackendRemote.getContextEvents(accountId)
    emitter.on('ImexProgress', onImexProgress)
    return () => {
      emitter.off('ImexProgress', onImexProgress)
    }
  }, [backupFile, onClose, accountId])

  const tx = useTranslationFunction()
  return (
    <DialogWithHeader onClose={onClose} title={tx('import_backup_title')}>
      <DialogBody>
        <DialogContent>
          {error && (
            <p>
              {tx('error')}: {error}
            </p>
          )}
          <DeltaProgressBar
            progress={importProgress}
            intent={error ? 'danger' : 'primary'}
          />
        </DialogContent>
        <DialogFooter>
          <FooterActions align='end'>
            <FooterActionButton onClick={cancel}>
              {tx('cancel')}
            </FooterActionButton>
          </FooterActions>
        </DialogFooter>
      </DialogBody>
    </DialogWithHeader>
  )
}
