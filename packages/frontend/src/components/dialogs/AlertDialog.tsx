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

export type Props = {
  cb?: () => void
  message: string
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
          <p className='whitespace'>{message}</p>
        </DialogContent>
      </DialogBody>
      <DialogFooter>
        <FooterActions>
          <FooterActionButton styling='secondary' onClick={onClick}>
            {okBtnLabel || tx('ok')}
          </FooterActionButton>
        </FooterActions>
      </DialogFooter>
    </Dialog>
  )
}
