import React from 'react'

import { QrCodeScanQrInner } from './QrCode'
import { DialogWithHeader } from '../Dialog'
import useTranslationFunction from '../../hooks/useTranslationFunction'

import type { DialogProps } from '../../contexts/DialogContext'
import { SCAN_CONTEXT_TYPE } from '../../hooks/useProcessQr'

/**
 * used to scan a QR code in other context
 * than the invitation qr code dialog
 * - UseOtherServerDialog
 */
export default function QrCodeScanner({
  onClose,
  scanContext,
}: DialogProps & { scanContext: SCAN_CONTEXT_TYPE }) {
  const tx = useTranslationFunction()

  return (
    <DialogWithHeader
      title={tx('qrscan_title')}
      onClose={onClose}
      dataTestid='qrscan-dialog'
    >
      <QrCodeScanQrInner onClose={onClose} scanContext={scanContext} />
    </DialogWithHeader>
  )
}
