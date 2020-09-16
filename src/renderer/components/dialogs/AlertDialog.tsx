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
  cb: () => {}
  message: string
  onClose: () => {}
}) {
  const tx = useTranslationFunction()
  const isOpen = !!message

  const onClick = () => {
    cb && cb()
    onClose()
  }

  return (
    <SmallDialog isOpen={isOpen} onClose={onClose}>
      <div className='bp3-dialog-body-with-padding'>
        <p>{message}</p>
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
