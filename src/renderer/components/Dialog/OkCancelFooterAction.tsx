import React from 'react'

import DialogFooter from './DialogFooter'
import FooterActionButton from './FooterActionButton'
import FooterActions from './FooterActions'
import useTranslationFunction from '../../hooks/useTranslationFunction'

type Props = {
  cancelLabel?: string
  confirmLabel?: string
  disableOK?: boolean
  onCancel: () => void
  onOk: () => void
}

export default function OkCancelFooterAction({
  onCancel,
  onOk,
  disableOK = false,
  cancelLabel,
  confirmLabel,
}: Props) {
  const tx = useTranslationFunction()

  cancelLabel = cancelLabel || tx('cancel')
  confirmLabel = confirmLabel || tx('ok')

  return (
    <DialogFooter>
      <FooterActions>
        <FooterActionButton onClick={onCancel}>
          {cancelLabel}
        </FooterActionButton>
        <FooterActionButton disabled={disableOK} onClick={onOk}>
          {confirmLabel}
        </FooterActionButton>
      </FooterActions>
    </DialogFooter>
  )
}
