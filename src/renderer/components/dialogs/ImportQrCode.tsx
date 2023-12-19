import React from 'react'

import { QrCodeScanQrInner } from './QrCode'
import { DialogWithHeader } from '../Dialog'
import useTranslationFunction from '../../hooks/useTranslationFunction'

import type { DialogProps } from '../../contexts/DialogContext'

type Props = {
  subtitle: string
}

export default function ImportQrCode({
  subtitle,
  onClose,
}: Props & DialogProps) {
  const tx = useTranslationFunction()

  return (
    <DialogWithHeader title={tx('qrscan_title')} onClose={onClose}>
      <QrCodeScanQrInner subtitle={subtitle} onClose={onClose} />
    </DialogWithHeader>
  )
}
