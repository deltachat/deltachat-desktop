import React, { useRef, useCallback } from 'react'

import { DialogBody, DialogFooter, FooterActions } from '../../Dialog'
import FooterActionButton from '../../Dialog/FooterActionButton'
import QrReader from '../../QrReader'
import useProcessQr from '../../../hooks/useProcessQr'
import { selectedAccountId } from '../../../ScreenController'
import { DialogWithHeader } from '../../Dialog'
import useTranslationFunction from '../../../hooks/useTranslationFunction'
import { getLogger } from '../../../../shared/logger'

import styles from './styles.module.scss'

import type { DialogProps } from '../../../contexts/DialogContext'
import useAlertDialog from '../../../hooks/dialog/useAlertDialog'
import { runtime } from '../../../runtime'

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

  const handleScan = useCallback(
    async (data: string) => {
      if (data && !processingQrCode.current) {
        processingQrCode.current = true
        try {
          await processQr(accountId, data, onDone)
        } catch (error: any) {
          log.errorWithoutStackTrace('QrReader process error: ', error)
          openAlertDialog({
            message: error.message || error.toString(),
          })
        }
        processingQrCode.current = false
      } else if (processingQrCode.current === true) {
        log.debug('Already processing a qr code')
      }
    },
    [accountId, processQr, onDone, openAlertDialog]
  )

  const handleError = (err: string) => {
    log.error('QrReader error: ' + err)
  }

  return (
    <DialogWithHeader
      title={tx('multidevice_receiver_title')}
      onClose={onClose}
    >
      <DialogBody>
        <ReceiveBackupSteps />
        <QrReader onScan={handleScan} onError={handleError} />
      </DialogBody>
      <DialogFooter>
        <FooterActions align='spaceBetween'>
          <FooterActionButton
            onClick={() =>
              runtime.openHelpWindow('multiclient-troubleshooting')
            }
          >
            {tx('troubleshooting')}
          </FooterActionButton>
          <FooterActionButton onClick={onClose}>
            {tx('close')}
          </FooterActionButton>
        </FooterActions>
      </DialogFooter>
    </DialogWithHeader>
  )
}

function ReceiveBackupSteps() {
  const tx = useTranslationFunction()

  return (
    <div className={styles.sendBackupSteps}>
      <ol className={styles.sendBackupStepsList}>
        <li>{tx('multidevice_receiver_title')}</li>
        <li>{tx('multidevice_open_settings_on_other_device')}</li>
      </ol>
      {tx('multidevice_experimental_hint')}
    </div>
  )
}
