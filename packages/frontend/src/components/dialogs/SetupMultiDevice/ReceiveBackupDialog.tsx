import React, { useRef, useCallback } from 'react'

import { DialogBody, DialogFooter, FooterActions } from '../../Dialog'
import FooterActionButton from '../../Dialog/FooterActionButton'
import { QrReader } from '../../QrReader'
import useProcessQr from '../../../hooks/useProcessQr'
import { selectedAccountId } from '../../../ScreenController'
import { DialogWithHeader } from '../../Dialog'
import useTranslationFunction from '../../../hooks/useTranslationFunction'
import { getLogger } from '../../../../../shared/logger'

import styles from './styles.module.scss'

import type { DialogProps } from '../../../contexts/DialogContext'
import useAlertDialog from '../../../hooks/dialog/useAlertDialog'
import { runtime } from '@deltachat-desktop/runtime-interface'
import { SCAN_CONTEXT_TYPE } from '../../../hooks/useProcessQr'

const log = getLogger('renderer/dialogs/SetupMultiDevice/ReceiveBackup')

type Props = {
  subtitle: string
}

export function ReceiveBackupDialog({ onClose }: Props & DialogProps) {
  const tx = useTranslationFunction()
  const accountId = selectedAccountId()
  const processQr = useProcessQr()
  const processingQrCode = useRef(false)
  const openAlertDialog = useAlertDialog()

  const onDone = useCallback(() => {
    onClose()
    processingQrCode.current = false
  }, [onClose])

  const handleError = useCallback(
    (error: any) => {
      log.errorWithoutStackTrace('QrReader process error: ', error)
      const errorMessage = error?.message || error.toString()
      openAlertDialog({
        message: `${tx('qrscan_failed')} ${errorMessage}`,
      })
    },
    [openAlertDialog, tx]
  )

  const handleScan = useCallback(
    async (data: string) => {
      if (data && !processingQrCode.current) {
        processingQrCode.current = true
        try {
          await processQr(
            accountId,
            data,
            SCAN_CONTEXT_TYPE.TRANSFER_BACKUP,
            onDone
          )
        } catch (error: any) {
          log.errorWithoutStackTrace('QrReader process error: ', error)
          handleError(error)
        }
        processingQrCode.current = false
      } else if (processingQrCode.current === true) {
        log.debug('Already processing a qr code')
      }
    },
    [accountId, processQr, onDone, handleError]
  )

  return (
    <DialogWithHeader
      title={tx('multidevice_receiver_title')}
      onClose={onClose}
    >
      <DialogBody>
        <p className={styles.receiveSteps}>
          {tx('multidevice_open_settings_on_other_device')}
        </p>
        <QrReader onScanSuccess={handleScan} onError={handleError} />
      </DialogBody>
      <DialogFooter>
        <FooterActions align='spaceBetween'>
          <FooterActionButton
            onClick={() => runtime.openHelpWindow('multiclient')}
          >
            {tx('troubleshooting')}
          </FooterActionButton>
        </FooterActions>
      </DialogFooter>
    </DialogWithHeader>
  )
}
