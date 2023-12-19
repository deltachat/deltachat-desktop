import React from 'react'

import useTranslationFunction from '../../hooks/useTranslationFunction'
import {
  SmallDialog,
  DeltaDialogFooter,
  DeltaDialogFooterActions,
} from './DeltaDialog'

import type { DialogProps } from '../../contexts/DialogContext'

export default function AlertDialog({
  message,
  onClose,
  cb,
}: {
  cb?: () => void
  message: string | JSX.Element
} & DialogProps) {
  const tx = useTranslationFunction()

  const onClick = () => {
    cb && cb()
    onClose()
  }

  return (
    <SmallDialog onClose={onClose}>
      <div className='bp4-dialog-body-with-padding'>
        <p style={{ userSelect: 'auto' }}>{message}</p>
      </div>
      <DeltaDialogFooter style={{ padding: '0px 20px 10px' }}>
        <DeltaDialogFooterActions>
          <p className='delta-button bold primary' onClick={() => onClick()}>
            {tx('ok')}
          </p>
        </DeltaDialogFooterActions>
      </DeltaDialogFooter>
    </SmallDialog>
  )
}
