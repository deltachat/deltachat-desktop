import React from 'react'

import { BackendRemote } from '../../backend-com'
import { runtime } from '@deltachat-desktop/runtime-interface'
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
import useDialog from '../../hooks/dialog/useDialog'

import type { DialogProps } from '../../contexts/DialogContext'
import { SCAN_CONTEXT_TYPE } from '../../hooks/useProcessQr'

const VERIFICATION_ENABLED_ANCHOR = 'e2ee'
const VERIFICATION_REQUIRED_ANCHOR = 'howtoe2ee'

export function VerifiedContactsRequiredDialog({ onClose }: DialogProps) {
  const tx = useTranslationFunction()
  const { openDialog } = useDialog()
  const accountId = selectedAccountId()

  const onQRScan = async () => {
    const [qrCode, qrCodeSVG] =
      await BackendRemote.rpc.getChatSecurejoinQrCodeSvg(accountId, null)
    onClose()
    openDialog(QrCode, {
      selectScan: true,
      qrCode,
      qrCodeSVG,
      scanContext: SCAN_CONTEXT_TYPE.DEFAULT,
    })
  }

  const onLearnMore = () => {
    runtime.openHelpWindow(VERIFICATION_REQUIRED_ANCHOR)
  }

  return (
    <Dialog onClose={onClose}>
      <DialogBody>
        <DialogContent paddingTop>
          <p>{tx('verified_contact_required_explain')}</p>
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

export function ProtectionEnabledDialog({ onClose }: DialogProps) {
  const tx = useTranslationFunction()

  const onLearnMore = () => {
    runtime.openHelpWindow(VERIFICATION_ENABLED_ANCHOR)
  }

  return (
    <Dialog onClose={onClose}>
      <DialogBody>
        <DialogContent paddingTop>
          <p>{tx('chat_protection_enabled_explanation')}</p>
        </DialogContent>
      </DialogBody>
      <DialogFooter>
        <FooterActions align='spaceBetween'>
          <FooterActionButton onClick={onLearnMore}>
            {tx('learn_more')}
          </FooterActionButton>
          <FooterActionButton onClick={onClose}>{tx('ok')}</FooterActionButton>
        </FooterActions>
      </DialogFooter>
    </Dialog>
  )
}
