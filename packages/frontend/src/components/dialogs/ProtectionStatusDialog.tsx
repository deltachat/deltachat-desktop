import React from 'react'

import { runtime } from '@deltachat-desktop/runtime-interface'
import Dialog, {
  DialogBody,
  DialogContent,
  DialogFooter,
  FooterActionButton,
  FooterActions,
} from '../Dialog'
import useTranslationFunction from '../../hooks/useTranslationFunction'

import type { DialogProps } from '../../contexts/DialogContext'

const VERIFICATION_ENABLED_ANCHOR = 'e2ee'

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
