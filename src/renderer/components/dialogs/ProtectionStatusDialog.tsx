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
import type { DialogProps } from './DialogController'
import QrCode from './QrCode'

const WebLinks = {
  Broken: "https://staging.delta.chat/733/en/help#verificationbroken",
  Enabled: "https://staging.delta.chat/733/en/help#verifiedchats"
}


export function ProtectionBrokenDialog({
  name,
  isOpen,
  onClose,
}: { name: string } & DialogProps) {
  const tx = useTranslationFunction()
  const { openDialog } = useContext(ScreenContext)
  const accountId = selectedAccountId()

  return (
    <SmallDialog isOpen={isOpen} onClose={onClose}>
      <div className='bp4-dialog-body-with-padding'>
        <p
          style={{
            wordBreak: 'break-word',
          }}
        >
          {tx('chat_protection_broken_explanation', name)}
        </p>
      </div>
      <DeltaDialogFooter style={{ padding: '0px 20px 10px' }}>
        <DeltaDialogFooterActions>
          <p
            className='delta-button bold primary'
            onClick={() =>
              runtime.openLink(WebLinks.Broken)
            } /* TODO better link to inApp help at some point? */
            style={{ marginRight: '10px' }}
          >
            {tx('learn_more')}
          </p>
          <p
            className={`delta-button bold primary`}
            onClick={async () => {
              const [
                qrCode,
                qrCodeSVG,
              ] = await BackendRemote.rpc.getChatSecurejoinQrCodeSvg(
                accountId,
                null
              )
              onClose()
              openDialog(QrCode, { selectScan: true, qrCode, qrCodeSVG })
            }}
          >
            {tx('qrscan_title')}
          </p>
          <p className={`delta-button bold primary`} onClick={() => onClose()}>
            {tx('ok')}
          </p>
        </DeltaDialogFooterActions>
      </DeltaDialogFooter>
    </SmallDialog>
  )
}


export function ProtectionEnabledDialog({
  isOpen,
  onClose,
}: DialogProps) {
  const tx = useTranslationFunction()

  return (
    <SmallDialog isOpen={isOpen} onClose={onClose}>
      <div className='bp4-dialog-body-with-padding'>
        <p
          style={{
            wordBreak: 'break-word',
          }}
        >
          {tx('chat_protection_enabled_explanation')}
        </p>
      </div>
      <DeltaDialogFooter style={{ padding: '0px 20px 10px' }}>
        <DeltaDialogFooterActions>
          <p
            className='delta-button bold primary'
            onClick={() =>
              runtime.openLink(WebLinks.Enabled)
            } /* TODO better link to inApp help at some point? */
            style={{ marginRight: '10px' }}
          >
            {tx('learn_more')}
          </p>
          <p className={`delta-button bold primary`} onClick={() => onClose()}>
            {tx('ok')}
          </p>
        </DeltaDialogFooterActions>
      </DeltaDialogFooter>
    </SmallDialog>
  )
}
