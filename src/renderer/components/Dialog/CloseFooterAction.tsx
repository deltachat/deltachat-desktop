import React from 'react'

import DialogFooter from './DialogFooter'
import FooterActionButton from './FooterActionButton'
import FooterActions from './FooterActions'
import { useTranslationFunction } from '../../contexts'

type Props = {
  onClose: () => void
}

export default function CloseFooterAction({ onClose }: Props) {
  const tx = useTranslationFunction()

  return (
    <DialogFooter>
      <FooterActions>
        <FooterActionButton onClick={onClose}>{tx('close')}</FooterActionButton>
      </FooterActions>
    </DialogFooter>
  )
}
