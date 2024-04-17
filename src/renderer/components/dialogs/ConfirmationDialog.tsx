import React from 'react'

import Dialog, {
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  FooterActions,
} from '../Dialog'
import FooterActionButton from '../Dialog/FooterActionButton'
import useTranslationFunction from '../../hooks/useTranslationFunction'

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

  const handleClick = (yes: boolean) => {
    onClose()
    cb(yes)
  }

  const handleClose = () => {
    onClose()
    cb(false)
  }

  return (
    <Dialog onClose={handleClose}>
      {header && <DialogHeader title={header} />}
      <DialogBody>
        <DialogContent paddingTop={header === undefined}>
          <p>{message}</p>
        </DialogContent>
      </DialogBody>
      <DialogFooter>
        <FooterActions>
          <FooterActionButton onClick={() => handleClick(false)}>
            {cancelLabel || tx('cancel')}
          </FooterActionButton>
          <FooterActionButton
            danger={isConfirmDanger}
            onClick={() => handleClick(true)}
          >
            {confirmLabel || tx('yes')}
          </FooterActionButton>
        </FooterActions>
      </DialogFooter>
    </Dialog>
  )
}
