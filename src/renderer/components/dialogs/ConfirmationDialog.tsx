import React from 'react'
import { MessageBoxOptions } from 'electron'
import {
  SmallDialog,
  DeltaDialogFooter,
  DeltaDialogFooterActions,
} from './DeltaDialog'
import { useTranslationFunction } from '../../contexts'

export default function ConfirmationDialog({
  message,
  cancelLabel,
  confirmLabel,
  cb,
  onClose,
  isConfirmDanger = false,
  noMargin = false,
  header,
}: {
  message: string
  cancelLabel?: string
  confirmLabel?: string
  cb: (yes: boolean) => {}
  onClose: () => {}
  isConfirmDanger?: boolean
  noMargin?: boolean
  header?: string
}) {
  const isOpen = !!message
  const tx = useTranslationFunction()

  const onClick = (yes: boolean) => {
    onClose()
    cb(yes)
  }

  return (
    <SmallDialog isOpen={isOpen} onClose={onClose}>
      <div className='bp3-dialog-body-with-padding'>
        {header && (
          <div
            style={{
              fontSize: '1.5em',
              fontWeight: 'lighter',
              marginBottom: '6px',
            }}
          >
            {header}
          </div>
        )}
        <p>{message}</p>
      </div>
      <DeltaDialogFooter style={{ padding: '0px 20px 10px' }}>
        <DeltaDialogFooterActions>
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
            }`}
            onClick={() => onClick(true)}
          >
            {confirmLabel || tx('yes')}
          </p>
        </DeltaDialogFooterActions>
      </DeltaDialogFooter>
    </SmallDialog>
  )
}
