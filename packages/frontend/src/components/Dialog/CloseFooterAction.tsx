import React from 'react'

import DialogFooter from './DialogFooter'
import FooterActionButton from './FooterActionButton'
import FooterActions from './FooterActions'
import useTranslationFunction from '../../hooks/useTranslationFunction'

import type { DialogProps } from '../../contexts/DialogContext'

export default function CloseFooterAction({ onClose }: DialogProps) {
  const tx = useTranslationFunction()

  return (
    <DialogFooter>
      <FooterActions>
        <FooterActionButton styling='primary' onClick={onClose}>
          {tx('close')}
        </FooterActionButton>
      </FooterActions>
    </DialogFooter>
  )
}
