import React from 'react'

import { useTranslationFunction } from '../../contexts'
import SmallDialog from '../SmallDialog'
import { DialogFooter, FooterActions } from '../Dialog'

type Props = {
  cb?: () => void
  message: string | JSX.Element
  onClose: () => void
}

export default function AlertDialog({ message, onClose, cb }: Props) {
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
      <DialogFooter style={{ padding: '0px 20px 10px' }}>
        <FooterActions>
          <p className='delta-button bold primary' onClick={() => onClick()}>
            {tx('ok')}
          </p>
        </FooterActions>
      </DialogFooter>
    </SmallDialog>
  )
}
