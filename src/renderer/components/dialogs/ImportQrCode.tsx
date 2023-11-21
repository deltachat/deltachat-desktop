import React from 'react'
import DeltaDialog from './DeltaDialog'
import { QrCodeScanQrInner } from './QrCode'

import type { DialogProps } from '../../contexts/DialogContext'

export default function ImportQrCode({
  subtitle,
  onClose,
}: {
  subtitle: string
} & DialogProps) {
  const tx = window.static_translate
  return (
    <DeltaDialog
      className='delta-dialog'
      title={tx('qrscan_title')}
      onClose={onClose}
      showCloseButton={false}
    >
      <QrCodeScanQrInner subtitle={subtitle} onClose={onClose} />
    </DeltaDialog>
  )
}
