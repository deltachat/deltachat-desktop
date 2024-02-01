import React from 'react'

import { BackendRemote } from '../../backend-com'
import { runtime } from '../../runtime'
import { selectedAccountId } from '../../ScreenController'
import QrCode from './QrCode'
import Dialog, {
  DialogBody,
  DialogContent,
  DialogFooter,
  FooterActionButton,
  FooterActions,
} from '../Dialog'
import useTranslationFunction from '../../hooks/useTranslationFunction'
import useDialog from '../../hooks/useDialog'

import type { DialogProps } from '../../contexts/DialogContext'

export default function InvalidUnencryptedMailDialog({ onClose }: DialogProps) {
  const tx = useTranslationFunction()
  const { openDialog } = useDialog()
  const accountId = selectedAccountId()

  const onQRScan = async () => {
    const [qrCode, qrCodeSVG] =
      await BackendRemote.rpc.getChatSecurejoinQrCodeSvg(accountId, null)
    onClose()
    openDialog(QrCode, { selectScan: true, qrCode, qrCodeSVG })
  }

  const onLearnMore = () => {
    runtime.openHelpWindow('howtoe2ee')
  }

  return (
    <Dialog onClose={onClose}>
      <DialogBody>
        <DialogContent paddingTop>
          <p>{tx('invalid_unencrypted_explanation')}</p>
        </DialogContent>
      </DialogBody>
      <DialogFooter>
        <FooterActions align='spaceBetween'>
          <FooterActionButton onClick={onLearnMore}>
            {tx('learn_more')}
          </FooterActionButton>
          <FooterActionButton onClick={onQRScan}>
            {tx('qrscan_title')}
          </FooterActionButton>
          <FooterActionButton onClick={onClose}>{tx('ok')}</FooterActionButton>
        </FooterActions>
      </DialogFooter>
    </Dialog>
  )
}
