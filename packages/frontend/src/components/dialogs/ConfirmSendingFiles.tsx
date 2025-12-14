import React from 'react'

import useTranslationFunction from '../../hooks/useTranslationFunction'
import Dialog, {
  DialogBody,
  DialogContent,
  DialogFooter,
  FooterActionButton,
  FooterActions,
} from '../Dialog'

import type { DialogProps } from '../../contexts/DialogContext'

type Props = {
  onClick: (isConfirmed: boolean) => void
  sanitizedFileList: Pick<File, 'name'>[]
  chatName: string
} & DialogProps

export default function ConfirmSendingFiles({
  onClick,
  sanitizedFileList,
  chatName,
  ...dialogProps
}: Props) {
  const { onClose } = dialogProps
  const tx = useTranslationFunction()

  const handleCancel = () => {
    onClose()
    onClick(false)
  }

  const handleConfirm = () => {
    onClose()
    onClick(true)
  }

  const fileCount = sanitizedFileList.length

  return (
    <Dialog onClose={onClose}>
      <DialogBody>
        <DialogContent paddingTop>
          <p style={{ wordBreak: 'break-word' }}>
            {tx(
              'ask_send_following_n_files_to',
              fileCount > 1 ? [String(fileCount), chatName] : [chatName],
              {
                quantity: fileCount,
              }
            )}
          </p>
          <ul className='drop-file-dialog-file-list'>
            {sanitizedFileList.map(({ name }) => (
              <li key={name}>{' - ' + name}</li>
            ))}
          </ul>
        </DialogContent>
      </DialogBody>
      <DialogFooter>
        <FooterActions>
          <FooterActionButton onClick={handleCancel}>
            {tx('cancel')}
          </FooterActionButton>
          <FooterActionButton onClick={handleConfirm}>
            {tx('menu_send')}
          </FooterActionButton>
        </FooterActions>
      </DialogFooter>
    </Dialog>
  )
}
