import React from 'react'

import { useTranslationFunction } from '../../contexts'
import Dialog, {
  DialogBody,
  DialogContent,
  DialogFooter,
  FooterActionButton,
  FooterActions,
} from '../Dialog'

type Props = {
  cb?: () => void
  message: string | JSX.Element
  onClose: () => void
}

export default function AlertDialog({ message, onClose, cb }: Props) {
  const tx = useTranslationFunction()
  const isOpen = !!message

  const onClick = () => {
    cb && cb()
    onClose()
  }

  return (
    <Dialog isOpen={isOpen} onClose={onClose}>
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
