import React from 'react'

import { QrCodeScanQrInner } from './QrCode'
import { DialogWithHeader } from '../Dialog'
import useTranslationFunction from '../../hooks/useTranslationFunction'

import type { DialogProps } from '../../contexts/DialogContext'

export default function QrCodeScanner({ onClose }: DialogProps) {
  const tx = useTranslationFunction()

  return (
    <DialogWithHeader title={tx('qrscan_title')} onClose={onClose}>
      <QrCodeScanQrInner onClose={onClose} />
    </DialogWithHeader>
  )
}
