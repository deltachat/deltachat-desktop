import React, { useContext } from 'react'

import { BackendRemote } from '../../backend-com'
import { ScreenContext, useTranslationFunction } from '../../contexts'
import { runtime } from '../../runtime'
import { selectedAccountId } from '../../ScreenController'
import {
  SmallDialog,
  DeltaDialogFooter,
  DeltaDialogFooterActions,
} from './DeltaDialog'
import QrCode from './QrCode'

import type { DialogProps } from './DialogController'

const VERIFICATION_BROKEN_URL =
  'https://staging.delta.chat/733/en/help#verificationbroken'
const VERIFICATION_ENABLED_URL =
  'https://staging.delta.chat/733/en/help#verifiedchats'
const VERIFICATION_REQUIRED_URL =
  'https://staging.delta.chat/746/en/help#howtoe2ee'

export function ProtectionBrokenDialog({
  name,
  isOpen,
  onClose,
}: { name: string } & DialogProps) {
  const tx = useTranslationFunction()
  const { openDialog } = useContext(ScreenContext)
  const accountId = selectedAccountId()

  const onQRScan = async () => {
    const [
      qrCode,
      qrCodeSVG,
    ] = await BackendRemote.rpc.getChatSecurejoinQrCodeSvg(accountId, null)
    onClose()
    openDialog(QrCode, { selectScan: true, qrCode, qrCodeSVG })
  }

  const onLearnMore = () => {
    runtime.openLink(VERIFICATION_BROKEN_URL)
  }

  return (
    <SmallDialog isOpen={isOpen} onClose={onClose}>
      <div className='bp4-dialog-body-with-padding'>
        <p style={{ wordBreak: 'break-word' }}>
          {tx('chat_protection_broken_explanation', name)}
        </p>
      </div>
      <DeltaDialogFooter style={{ padding: '0px 20px 10px' }}>
        <DeltaDialogFooterActions style={{ justifyContent: 'space-between' }}>
          <p
            className='delta-button bold primary'
            onClick={onLearnMore}
            style={{ marginRight: '10px' }}
          >
            {tx('learn_more')}
          </p>
          <p className={`delta-button bold primary`} onClick={onQRScan}>
            {tx('qrscan_title')}
          </p>
          <p className={`delta-button bold primary`} onClick={onClose}>
            {tx('ok')}
          </p>
        </DeltaDialogFooterActions>
      </DeltaDialogFooter>
    </SmallDialog>
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
    const [
      qrCode,
      qrCodeSVG,
    ] = await BackendRemote.rpc.getChatSecurejoinQrCodeSvg(accountId, null)
    onClose()
    openDialog(QrCode, { selectScan: true, qrCode, qrCodeSVG })
  }

  const onLearnMore = () => {
    runtime.openLink(VERIFICATION_REQUIRED_URL)
  }

  return (
    <SmallDialog isOpen={isOpen} onClose={onClose}>
      <div className='bp4-dialog-body-with-padding'>
        <p style={{ wordBreak: 'break-word' }}>
          {tx('verified_contact_required_explain')}
        </p>
      </div>
      <DeltaDialogFooter style={{ padding: '0px 20px 10px' }}>
        <DeltaDialogFooterActions style={{ justifyContent: 'space-between' }}>
          <p
            className='delta-button bold primary'
            onClick={onLearnMore}
            style={{ marginRight: '10px' }}
          >
            {tx('learn_more')}
          </p>
          <p className={`delta-button bold primary`} onClick={onQRScan}>
            {tx('qrscan_title')}
          </p>
          <p className={`delta-button bold primary`} onClick={onClose}>
            {tx('ok')}
          </p>
        </DeltaDialogFooterActions>
      </DeltaDialogFooter>
    </SmallDialog>
  )
}

export function ProtectionEnabledDialog({ isOpen, onClose }: DialogProps) {
  const tx = useTranslationFunction()

  const onLearnMore = () => {
    runtime.openLink(VERIFICATION_ENABLED_URL)
  }

  return (
    <SmallDialog isOpen={isOpen} onClose={onClose}>
      <div className='bp4-dialog-body-with-padding'>
        <p style={{ wordBreak: 'break-word' }}>
          {tx('chat_protection_enabled_explanation')}
        </p>
      </div>
      <DeltaDialogFooter style={{ padding: '0px 20px 10px' }}>
        <DeltaDialogFooterActions style={{ justifyContent: 'space-between' }}>
          <p
            className='delta-button bold primary'
            onClick={onLearnMore}
            style={{ marginRight: '10px' }}
          >
            {tx('learn_more')}
          </p>
          <p className={`delta-button bold primary`} onClick={onClose}>
            {tx('ok')}
          </p>
        </DeltaDialogFooterActions>
      </DeltaDialogFooter>
    </SmallDialog>
  )
}
