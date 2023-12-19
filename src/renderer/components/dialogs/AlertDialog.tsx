import React from 'react'

import Dialog, {
  DialogBody,
  DialogContent,
  DialogFooter,
  FooterActionButton,
  FooterActions,
} from '../Dialog'
import useTranslationFunction from '../../hooks/useTranslationFunction'

import type { DialogProps } from '../../contexts/DialogContext'

type Props = {
  cb?: () => void
  message: string | JSX.Element
} & DialogProps

export default function AlertDialog({ message, onClose, cb }: Props) {
  const tx = useTranslationFunction()

  const onClick = () => {
    cb && cb()
    onClose()
  }

  return (
    <Dialog onClose={onClose}>
      <DialogBody>
        <DialogContent>
          <p>{message}</p>
        </DialogContent>
      </DialogBody>
      <DialogFooter>
        <FooterActions>
          <FooterActionButton onClick={onClick}>{tx('ok')}</FooterActionButton>
        </FooterActions>
      </DialogFooter>
    </Dialog>
  )
}
