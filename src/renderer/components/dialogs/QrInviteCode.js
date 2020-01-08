import React from 'react'
import DeltaDialog, { DeltaDialogBody, DeltaDialogContent, DeltaDialogFooter } from './DeltaDialog'
import qr from 'react-qr-svg'

export function DeltaDialogQrInner ({ qrCode, description }) {
  return (
    <>
      <DeltaDialogBody>
        <DeltaDialogContent noOverflow noPadding>
          <qr.QRCode
            bgColor='#FFFFFF'
            fgColor='#000000'
            level='Q'
            value={qrCode}
            style={{ padding: '0px 20px', backgroundColor: 'white' }}
          />
        </DeltaDialogContent>
      </DeltaDialogBody>
      <DeltaDialogFooter>
        <p style={{ textAlign: 'center' }}>{description}</p>
      </DeltaDialogFooter>
    </>
  )
}

export default function QrInviteCode ({ onClose, isOpen, qrCode, deltachat }) {
  const tx = window.translate
  return (
    <DeltaDialog
      title={tx('qrshow_join_contact_title')}
      isOpen={isOpen}
      onClose={onClose}
    >
      <DeltaDialogQrInner description={tx('qrshow_join_contact_hint', [deltachat.credentials.addr])} qrCode={qrCode} />
    </DeltaDialog>
  )
}
