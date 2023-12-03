import { Intent } from '@blueprintjs/core'
import { DcEventType } from '@deltachat/jsonrpc-client'
import React, { useEffect, useState } from 'react'

import { getLogger } from '../../../../shared/logger'
import { BackendRemote } from '../../../backend-com'
import { useTranslationFunction } from '../../../contexts'
import { selectedAccountId } from '../../../ScreenController'
import { DeltaProgressBar } from '../../Login-Styles'
import { DialogProps } from '../DialogController'
import { DialogBody, DialogContent, DialogWithHeader } from '../../Dialog'

const log = getLogger('renderer/receive_backup')

export function ReceiveBackupDialog({
  onClose,
  isOpen,
  QrWithToken,
}: DialogProps) {
  const [importProgress, setImportProgress] = useState(0.0)
  const [error, setError] = useState<string | null>(null)

  const onImexProgress = ({ progress }: DcEventType<'ImexProgress'>) => {
    setImportProgress(progress)
  }

  const accountId = selectedAccountId()

  useEffect(() => {
    ;(async () => {
      try {
        log.debug(`Starting remote backup import of ${QrWithToken}`)
        await BackendRemote.rpc.getBackup(accountId, QrWithToken)
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message)
        }
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
  }, [QrWithToken, onClose, accountId])

  const tx = useTranslationFunction()
  return (
    <DialogWithHeader
      onClose={onClose}
      title={tx('multidevice_receiver_title')}
      isOpen={isOpen}
    >
      <DialogBody>
        <DialogContent>
          {error && (
            <p>
              {tx('error')}: {error}
            </p>
          )}
          <DeltaProgressBar
            progress={importProgress}
            intent={!error ? Intent.SUCCESS : Intent.DANGER}
          />
        </DialogContent>
      </DialogBody>
    </DialogWithHeader>
  )
}
