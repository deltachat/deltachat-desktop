import React, { useState, useRef } from 'react'
import DeltaDialog, { DeltaDialogBody, DeltaDialogContent } from './DeltaDialog'
import { Icon } from '@blueprintjs/core'
import { DesktopSettings } from '../../../shared/shared-types'
import { selectChat } from '../../stores/chat'
import QrReader from 'react-qr-reader'
import { Card, Spinner } from '@blueprintjs/core'
import { DeltaBackend } from '../../delta-remote'
import processOpenQrUrl from '../helpers/OpenQrUrl'
import { QrCodeScanQrInner } from './QrCode'

export default function ImportQrCode({
  onClose,
  isOpen,
  qrCode,
}: {
  onClose: () => void
  isOpen: boolean
  qrCode: string
  deltachat: DesktopSettings
}) {
  const tx = window.static_translate
  const Dialog = DeltaDialog as any // todo remove this cheat.
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
