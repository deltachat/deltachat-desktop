import React from 'react'

import Dialog, {
  DialogBody,
  DialogContent,
  DialogFooter,
  FooterActionButton,
  FooterActions,
} from '../Dialog'
import { runtime } from '@deltachat-desktop/runtime-interface'
import useTranslationFunction from '../../hooks/useTranslationFunction'

import type { DialogProps } from '../../contexts/DialogContext'

type Props = {
  message: string
  content: string
  copyCb?: () => void
  cancelCb?: () => void
}

export default function QrCodeCopyConfirmationDialog({
  onClose,
  message,
  content,
  copyCb,
  cancelCb,
}: DialogProps & Props) {
  const tx = useTranslationFunction()

  const onCopy = async () => {
    await runtime.writeClipboardText(content).then(() => {
      copyCb && copyCb()
    })
    onClose()
  }

  const onCancel = () => {
    cancelCb && cancelCb()
    onClose()
  }

  return (
    <Dialog
      onClose={onClose}
      canEscapeKeyClose={true}
      canOutsideClickClose={true}
    >
      <DialogBody>
        <DialogContent paddingTop>
          <p>{message}</p>
          <div className='copy-content-preview'>{content}</div>
        </DialogContent>
      </DialogBody>
      <DialogFooter>
        <FooterActions>
          <FooterActionButton onClick={onCancel}>
            {tx('cancel')}
          </FooterActionButton>
          <FooterActionButton
            onClick={onCopy}
            data-testid='confirm-qr-code'
            styling='primary'
          >
            {tx('global_menu_edit_copy_desktop')}
          </FooterActionButton>
        </FooterActions>
      </DialogFooter>
    </Dialog>
  )
}
