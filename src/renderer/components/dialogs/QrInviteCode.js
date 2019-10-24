import React from 'react'
import DeltaDialog, { DeltaDialogBody, DeltaDialogFooter } from './DeltaDialog'
import { Card } from '@blueprintjs/core'
import qr from 'react-qr-svg'

export default function QrInviteCode ({ onClose, isOpen, qrCode, deltachat }) {
  const tx = window.translate
  return (
    <DeltaDialog
      title={tx('qrshow_join_contact_title')}
      isOpen={isOpen}
      onClose={onClose}
    >
      <DeltaDialogBody>
        <Card>
          <qr.QRCode
            bgColor='#FFFFFF'
            fgColor='#000000'
            level='Q'
            value={qrCode}
            style={{ padding: '20pt', width: '100%', backgroundColor: 'white' }}
          />
        </Card>
      </DeltaDialogBody>
      <DeltaDialogFooter>
        <p style={{ textAlign: 'center' }}>{tx('qrshow_join_contact_hint', [deltachat.credentials.addr])}</p>
      </DeltaDialogFooter>
    </DeltaDialog>
  )
}
