import React, { useContext } from 'react'
import DeltaDialog, {
  DeltaDialogBody,
  DeltaDialogContent,
  DeltaDialogFooter,
  DeltaDialogButton,
} from './DeltaDialog'
import qr from 'react-qr-svg'
import { ScreenContext } from '../../contexts'
import { Icon } from '@blueprintjs/core'
import { LocalSettings } from '../../../shared/shared-types'
import { DeltaButtonPrimary, DeltaButton } from './SmallDialog'

export function DeltaDialogQrInner({
  qrCode,
  description,
}: {
  qrCode: string
  description: string
}) {
  const tx = window.translate
  const { userFeedback } = useContext(ScreenContext)
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
          <div className='qr-data'>
            <div className='content' aria-label={tx('a11y_qr_data')}>
              {qrCode}
            </div>
            <div
              className='copy-btn'
              role='button'
              onClick={() => {
                navigator.clipboard.writeText(qrCode).then(_ =>
                  userFeedback({
                    type: 'success',
                    text: tx('a11y_copy_qr_data'),
                  })
                )
              }}
              aria-label={tx('copy_qr_data_success')}
            >
              <Icon icon='clipboard' />
            </div>
          </div>
        </DeltaDialogContent>
      </DeltaDialogBody>
      <DeltaDialogFooter>
        <p style={{ textAlign: 'center' }}>{description}</p>
      </DeltaDialogFooter>
    </>
  )
}

export default function QrInviteCode({
  onClose,
  isOpen,
  qrCode,
  deltachat,
}: {
  onClose: () => void
  isOpen: boolean
  qrCode: string
  deltachat: LocalSettings
}) {
  const tx = window.translate
  const Dialog = DeltaDialog as any // todo remove this cheat.
  return (
    <Dialog
      title={tx('qrshow_join_contact_title')}
      isOpen={isOpen}
      onClose={onClose}
      className='delta-dialog'
    >
      <DeltaDialogQrInner
        description={tx('qrshow_join_contact_hint', [
          deltachat.credentials.addr,
        ])}
        qrCode={qrCode}
      />
    </Dialog>
  )
}
