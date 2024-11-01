import React from 'react'

import Dialog, {
  DialogBody,
  DialogContent,
  DialogFooter,
  FooterActionButton,
  FooterActions,
} from '../Dialog'
import useTranslationFunction from '../../hooks/useTranslationFunction'

import type { ReactNode } from 'react'
import type { DialogProps } from '../../contexts/DialogContext'

export type Props = {
  cb?: () => void
  message: string | ReactNode
  okBtnLabel?: string
} & DialogProps

export default function AlertDialog({
  message,
  onClose,
  cb,
  okBtnLabel,
}: Props) {
  const tx = useTranslationFunction()

  const onClick = () => {
    cb && cb()
    onClose()
  }

  return (
    <Dialog width={350} onClose={onClose}>
      <DialogBody>
        <DialogContent paddingTop>
          <p>{message}</p>
        </DialogContent>
      </DialogBody>
      <DialogFooter>
        <FooterActions>
          <FooterActionButton onClick={onClick}>
            {okBtnLabel || tx('ok')}
          </FooterActionButton>
        </FooterActions>
      </DialogFooter>
    </Dialog>
  )
}
