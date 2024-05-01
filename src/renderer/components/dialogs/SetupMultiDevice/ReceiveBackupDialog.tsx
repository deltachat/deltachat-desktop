import React from 'react'

import { QrCodeScanQrInner } from '../QrCode'
import { DialogWithHeader } from '../../Dialog'
import useTranslationFunction from '../../../hooks/useTranslationFunction'

import styles from './styles.module.scss'

import type { DialogProps } from '../../../contexts/DialogContext'

type Props = {
  subtitle: string
}

export function ReceiveBackupDialog({ onClose }: Props & DialogProps) {
  const tx = useTranslationFunction()

  return (
    <DialogWithHeader
      title={tx('multidevice_receiver_title')}
      onClose={onClose}
    >
      <ReceiveBackupSteps />
      <QrCodeScanQrInner onClose={onClose} />
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
