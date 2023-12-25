import React from 'react'

import useTranslationFunction from '../../hooks/useTranslationFunction'
import {
  DeltaDialogFooter,
  DeltaDialogFooterActions,
  SmallDialog,
} from './DeltaDialog'

import type { DialogProps } from '../../contexts/DialogContext'
import Button from '../ui/Button'

type Props = {
  onClick: (isConfirmed: boolean) => void
  sanitizedFileList: Pick<File, 'name' | 'path' | 'type'>[]
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
    <SmallDialog onClose={onClose}>
      <div className='bp4-dialog-body-with-padding'>
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
      </div>
      <DeltaDialogFooter style={{ padding: '0px 20px 10px' }}>
        <DeltaDialogFooterActions>
          <Button type='primary' onClick={handleCancel}>
            {tx('cancel')}
          </Button>
          <Button type='primary' onClick={handleConfirm}>
            {tx('menu_send')}
          </Button>
        </DeltaDialogFooterActions>
      </DeltaDialogFooter>
    </SmallDialog>
  )
}
