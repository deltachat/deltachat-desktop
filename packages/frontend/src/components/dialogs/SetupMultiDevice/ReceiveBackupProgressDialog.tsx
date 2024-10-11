import { DcEventType } from '@deltachat/jsonrpc-client'
import React, { useEffect, useState } from 'react'

import { getLogger } from '../../../../../shared/logger'
import { BackendRemote } from '../../../backend-com'
import { selectedAccountId } from '../../../ScreenController'
import { DeltaProgressBar } from '../../Login-Styles'
import { DialogBody, DialogContent, DialogWithHeader } from '../../Dialog'
import useTranslationFunction from '../../../hooks/useTranslationFunction'

import type { DialogProps } from '../../../contexts/DialogContext'

const log = getLogger('renderer/receive_backup')

type Props = {
  QrWithToken: string
}

export function ReceiveBackupProgressDialog({
  onClose,
  QrWithToken,
}: Props & DialogProps) {
  const [importProgress, setImportProgress] = useState(0.0)
  const [error, setError] = useState<string | null>(null)
  const tx = useTranslationFunction()

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
      window.__updateAccountListSidebar?.()
    })()

    const emitter = BackendRemote.getContextEvents(accountId)
    emitter.on('ImexProgress', onImexProgress)
    return () => {
      emitter.off('ImexProgress', onImexProgress)
    }
  }, [QrWithToken, onClose, accountId])

  return (
    <DialogWithHeader
      onClose={onClose}
      title={tx('multidevice_receiver_title')}
      canOutsideClickClose={false}
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
            intent={error ? 'fail' : 'success'}
          />
        </DialogContent>
      </DialogBody>
    </DialogWithHeader>
  )
}
