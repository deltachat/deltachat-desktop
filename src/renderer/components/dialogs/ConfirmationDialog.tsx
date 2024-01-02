import React from 'react'

import useTranslationFunction from '../../hooks/useTranslationFunction'
import Dialog, {
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  FooterActions,
} from '../Dialog'
import FooterActionButton from '../Dialog/FooterActionButton'

import type { DialogProps } from '../../contexts/DialogContext'

export type Props = {
  message: string
  cancelLabel?: string
  confirmLabel?: string
  cb: (yes: boolean) => void
  isConfirmDanger?: boolean
  noMargin?: boolean
  header?: string
} & DialogProps

export default function ConfirmationDialog({
  message,
  cancelLabel,
  confirmLabel,
  cb,
  onClose,
  isConfirmDanger = false,
  header,
}: Props) {
  const tx = useTranslationFunction()

  const onClick = (yes: boolean) => {
    onClose()
    cb(yes)
  }

  return (
    <Dialog onClose={onClose}>
      {header && <DialogHeader title={header} />}
      <DialogBody>
        <DialogContent paddingTop={header === undefined}>
          <p>{message}</p>
        </DialogContent>
      </DialogBody>
      <DialogFooter>
        <FooterActions>
          <FooterActionButton onClick={() => onClick(false)}>
            {cancelLabel || tx('cancel')}
          </FooterActionButton>
          <FooterActionButton
            danger={isConfirmDanger}
            onClick={() => onClick(true)}
          >
            {confirmLabel || tx('yes')}
          </FooterActionButton>
        </FooterActions>
      </DialogFooter>
    </Dialog>
  )
}
