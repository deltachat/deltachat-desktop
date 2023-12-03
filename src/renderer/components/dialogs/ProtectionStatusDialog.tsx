import React, { useContext } from 'react'

import { BackendRemote } from '../../backend-com'
import { ScreenContext, useTranslationFunction } from '../../contexts'
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

import type { DialogProps } from './DialogController'

const VERIFICATION_BROKEN_ANCHOR = 'nocryptanymore'
const VERIFICATION_ENABLED_ANCHOR = 'e2eeguarantee'
const VERIFICATION_REQUIRED_ANCHOR = 'howtoe2ee'

export function ProtectionBrokenDialog({
  name,
  isOpen,
  onClose,
}: { name: string } & DialogProps) {
  const tx = useTranslationFunction()
  const { openDialog } = useContext(ScreenContext)
  const accountId = selectedAccountId()

  const onQRScan = async () => {
    const [qrCode, qrCodeSVG] =
      await BackendRemote.rpc.getChatSecurejoinQrCodeSvg(accountId, null)
    onClose()
    openDialog(QrCode, { selectScan: true, qrCode, qrCodeSVG })
  }

  const onLearnMore = () => {
    runtime.openHelpWindow(VERIFICATION_BROKEN_ANCHOR)
  }

  return (
    <Dialog isOpen={isOpen} onClose={onClose}>
      <DialogBody>
        <DialogContent paddingTop>
          <p>{tx('chat_protection_broken_explanation', name)}</p>
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

export function VerifiedContactsRequiredDialog({
  isOpen,
  onClose,
}: DialogProps) {
  const tx = useTranslationFunction()
  const { openDialog } = useContext(ScreenContext)
  const accountId = selectedAccountId()

  const onQRScan = async () => {
    const [qrCode, qrCodeSVG] =
      await BackendRemote.rpc.getChatSecurejoinQrCodeSvg(accountId, null)
    onClose()
    openDialog(QrCode, { selectScan: true, qrCode, qrCodeSVG })
  }

  const onLearnMore = () => {
    runtime.openHelpWindow(VERIFICATION_REQUIRED_ANCHOR)
  }

  return (
    <Dialog isOpen={isOpen} onClose={onClose}>
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

export function ProtectionEnabledDialog({ isOpen, onClose }: DialogProps) {
  const tx = useTranslationFunction()

  const onLearnMore = () => {
    runtime.openHelpWindow(VERIFICATION_ENABLED_ANCHOR)
  }

  return (
    <Dialog isOpen={isOpen} onClose={onClose}>
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
