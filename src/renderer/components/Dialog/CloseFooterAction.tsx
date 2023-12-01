import React from 'react'

import DialogFooter from './DialogFooter'
import FooterActions from './FooterActions'
import { useTranslationFunction } from '../../contexts'

export default function CloseFooterAction({ onClose }: { onClose: () => any }) {
  const tx = useTranslationFunction()

  return (
    <DialogFooter>
      <FooterActions>
        <p className={'delta-button bold primary'} onClick={onClose}>
          {tx('close')}
        </p>
      </FooterActions>
    </DialogFooter>
  )
}
