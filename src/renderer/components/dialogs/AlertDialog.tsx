import React from 'react'
import {
  SmallDialog,
  DeltaDialogFooter,
  DeltaDialogFooterActions,
} from './DeltaDialog'
import { useTranslationFunction } from '../../contexts'

export default function AlertDialog({
  message,
  onClose,
  cb,
}: {
  cb?: () => void
  message: string | JSX.Element
  onClose: () => void
}) {
  const tx = useTranslationFunction()
  const isOpen = !!message

  const onClick = () => {
    cb && cb()
    onClose()
  }

  return (
    <SmallDialog isOpen={isOpen} onClose={onClose}>
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
