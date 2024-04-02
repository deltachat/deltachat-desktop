import React from 'react'

import Dialog, {
  DialogBody,
  DialogContent,
  DialogFooter,
  FooterActionButton,
  FooterActions,
} from './Dialog'
import { runtime } from '../runtime'
import useTranslationFunction from '../hooks/useTranslationFunction'

import type { DialogProps } from '../contexts/DialogContext'

type Props = { message: string; content: string; cb?: () => void }

export default function CopyContentAlertDialog({
  onClose,
  message,
  content,
  cb,
}: DialogProps & Props) {
  const tx = useTranslationFunction()

  const onCopy = async () => {
    await runtime.writeClipboardText(content)
    onClose()
  }

  const onCancel = () => {
    cb && cb()
    onClose()
  }

  return (
    <Dialog onClose={onClose}>
      <DialogBody>
        <DialogContent paddingTop>
          <p>{message}</p>
        </DialogContent>
      </DialogBody>
      <DialogFooter>
        <FooterActions>
          <FooterActionButton onClick={onCopy}>
            {tx('global_menu_edit_copy_desktop')}
          </FooterActionButton>
          <FooterActionButton onClick={onCancel}>{tx('ok')}</FooterActionButton>
        </FooterActions>
      </DialogFooter>
    </Dialog>
  )
}
