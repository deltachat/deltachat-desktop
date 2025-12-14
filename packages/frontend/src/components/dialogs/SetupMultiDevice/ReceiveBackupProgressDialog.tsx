import { DcEventType } from '@deltachat/jsonrpc-client'
import React, { useEffect, useState } from 'react'

import { getLogger } from '../../../../../shared/logger'
import { BackendRemote } from '../../../backend-com'
import { selectedAccountId } from '../../../ScreenController'
import { DeltaProgressBar } from '../../Login-Styles'
import {
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogWithHeader,
  FooterActionButton,
  FooterActions,
} from '../../Dialog'
import useTranslationFunction from '../../../hooks/useTranslationFunction'

import type { DialogProps } from '../../../contexts/DialogContext'
import { runtime } from '@deltachat-desktop/runtime-interface'
import { unknownErrorToString } from '../../helpers/unknownErrorToString'

const log = getLogger('renderer/receive_backup')

type Props = {
  QrWithToken: string
}

// time it takes on progress === 0 to show the trouble shooting button in ms
const TROUBLESHOOTING_TIMEOUT = 4000

export function ReceiveBackupProgressDialog({
  onClose,
  QrWithToken,
}: Props & DialogProps) {
  const [importProgress, setImportProgress] = useState(0.0)
  const [error, setError] = useState<string | null>(null)
  const [troubleTimerFired, setTroubleTimerFired] = useState(false)
  const tx = useTranslationFunction()

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
        log.debug(`Starting remote backup import of ${QrWithToken}`)
        await BackendRemote.rpc.getBackup(accountId, QrWithToken)
      } catch (err) {
        setError(unknownErrorToString(err))
        return
      }
      onClose()
      window.__selectAccount(accountId)
    })()

    setTimeout(() => setTroubleTimerFired(true), TROUBLESHOOTING_TIMEOUT)

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
          <p>
            {importProgress === 0
              ? tx('connectivity_connecting')
              : tx('transferring')}
          </p>
          <DeltaProgressBar
            progress={importProgress}
            intent={error ? 'danger' : 'success'}
          />
          {troubleTimerFired && importProgress === 0 && (
            <p>{tx('multidevice_connection_takes_too_long')}</p>
          )}
        </DialogContent>
        <DialogFooter>
          <FooterActions align='spaceBetween'>
            <FooterActionButton
              onClick={() => runtime.openHelpWindow('multiclient')}
            >
              {tx('troubleshooting')}
            </FooterActionButton>
            <FooterActionButton onClick={cancel}>
              {tx('cancel')}
            </FooterActionButton>
          </FooterActions>
        </DialogFooter>
      </DialogBody>
    </DialogWithHeader>
  )
}
