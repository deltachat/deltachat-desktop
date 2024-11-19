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
  dataTestid = 'confirm-dialog',
}: Props) {
  const tx = useTranslationFunction()

  const handleClose = (result: string) => {
    cb(result === 'confirm')
    onClose()
  }

  return (
    <Dialog onClose={handleClose} data-testid={dataTestid}>
      {header && <DialogHeader title={header} />}
      <DialogBody>
        <DialogContent paddingTop={header === undefined}>
          <p>{message}</p>
        </DialogContent>
      </DialogBody>
      <DialogFooter>
        <FooterActions>
          <FooterActionButton
            formMethod='dialog'
            value='cancel'
            data-testid='cancel'
          >
            {cancelLabel || tx('cancel')}
          </FooterActionButton>
          <FooterActionButton
            styling={isConfirmDanger ? 'danger' : undefined}
            formMethod='dialog'
            value='confirm'
            data-testid='confirm'
          >
            {confirmLabel || tx('yes')}
          </FooterActionButton>
        </FooterActions>
      </DialogFooter>
    </Dialog>
  )
}
