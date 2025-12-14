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

  const handleClick = (yes: boolean) => {
    onClose()
    cb(yes)
  }

  const handleClose = () => {
    onClose()
    cb(false)
  }

  return (
    <Dialog onClose={handleClose} dataTestid={dataTestid}>
      {header && <DialogHeader title={header} />}
      <DialogBody>
        <DialogContent paddingTop={header === undefined}>
          <p className='whitespace'>{message}</p>
        </DialogContent>
      </DialogBody>
      <DialogFooter>
        <FooterActions>
          <FooterActionButton
            onClick={() => handleClick(false)}
            data-testid='cancel'
          >
            {cancelLabel || tx('cancel')}
          </FooterActionButton>
          <FooterActionButton
            styling={isConfirmDanger ? 'danger' : 'primary'}
            onClick={() => handleClick(true)}
            data-testid='confirm'
          >
            {confirmLabel || tx('yes')}
          </FooterActionButton>
        </FooterActions>
      </DialogFooter>
    </Dialog>
  )
}
