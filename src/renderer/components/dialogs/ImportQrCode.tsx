import React from 'react'

import { QrCodeScanQrInner } from './QrCode'
import { DialogWithHeader } from '../Dialog'
import { useTranslationFunction } from '../../contexts'

type Props = {
  subtitle: string
  onClose: () => void
  isOpen: boolean
}

export default function ImportQrCode({ subtitle, onClose, isOpen }: Props) {
  const tx = useTranslationFunction()

  return (
    <DialogWithHeader
      className='delta-dialog'
      title={tx('qrscan_title')}
      isOpen={isOpen}
      onClose={onClose}
      showCloseButton={false}
    >
      <QrCodeScanQrInner subtitle={subtitle} onClose={onClose} />
    </DialogWithHeader>
  )
}
