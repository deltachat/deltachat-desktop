import React from 'react'
import DeltaDialog from './DeltaDialog'
import { QrCodeScanQrInner } from './QrCode'

export default function ImportQrCode({
  onClose,
  isOpen,
}: {
  onClose: () => void
  isOpen: boolean
}) {
  const tx = window.static_translate
  return (
    <DeltaDialog
      className='delta-dialog'
      title={tx('qrscan_title')}
      isOpen={isOpen}
      onClose={onClose}
      isCloseButtonShown={false}
    >
      <QrCodeScanQrInner onClose={onClose} />
    </DeltaDialog>
  )
}
