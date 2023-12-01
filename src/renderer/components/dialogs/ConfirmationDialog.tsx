import React from 'react'

import { useTranslationFunction } from '../../contexts'
import SmallDialog from '../SmallDialog'
import { DialogFooter, FooterActions } from '../Dialog'

import type { DialogProps } from './DialogController'

type Props = {
  message: string
  cancelLabel?: string
  confirmLabel?: string
  cb: (yes: boolean) => void
  isConfirmDanger?: boolean
  noMargin?: boolean
  header?: string
} & DialogProps

export default function ConfirmationDialog({
  message,
  cancelLabel,
  confirmLabel,
  cb,
  onClose,
  isConfirmDanger = false,
  noMargin = false,
  header,
}: Props) {
  const isOpen = !!message
  const tx = useTranslationFunction()

  const onClick = (yes: boolean) => {
    onClose()
    cb(yes)
  }

  return (
    <SmallDialog isOpen={isOpen} onClose={onClose}>
      <div className='bp4-dialog-body-with-padding'>
        {header && (
          <div
            style={{
              fontSize: '1.5em',
              fontWeight: 'lighter',
              marginBottom: '6px',
              overflow: 'auto',
              wordBreak: 'break-word',
            }}
          >
            {header}
          </div>
        )}
        <p
          style={{
            wordBreak: 'break-word',
          }}
        >
          {message}
        </p>
      </div>
      <DialogFooter>
        <FooterActions>
          <p
            className='delta-button bold primary'
            onClick={() => onClick(false)}
            style={noMargin ? {} : { marginRight: '10px' }}
          >
            {cancelLabel || tx('cancel')}
          </p>
          <p
            className={`delta-button bold primary ${
              isConfirmDanger ? 'danger' : 'primary'
            } test-selector-confirm`}
            onClick={() => onClick(true)}
          >
            {confirmLabel || tx('yes')}
          </p>
        </FooterActions>
      </DialogFooter>
    </SmallDialog>
  )
}
