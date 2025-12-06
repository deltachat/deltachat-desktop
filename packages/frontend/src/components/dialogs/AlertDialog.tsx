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
  dataTestid?: string
} & DialogProps

export default function AlertDialog({
  message,
  onClose,
  cb,
  okBtnLabel,
  dataTestid,
}: Props) {
  const tx = useTranslationFunction()

  const onClick = () => {
    cb && cb()
    onClose()
  }

  return (
    <Dialog
      width={350}
      onClose={() => {
        cb && cb()
        onClose()
      }}
      dataTestid={dataTestid}
    >
      <DialogBody>
        <DialogContent paddingTop>
          <p className='whitespace'>{message}</p>
        </DialogContent>
      </DialogBody>
      <DialogFooter>
        <FooterActions>
          <FooterActionButton onClick={onClick} data-testid='alert-ok'>
            {okBtnLabel || tx('ok')}
          </FooterActionButton>
        </FooterActions>
      </DialogFooter>
    </Dialog>
  )
}
