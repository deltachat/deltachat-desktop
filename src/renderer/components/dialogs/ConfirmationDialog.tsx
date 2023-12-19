import React from 'react'

import {
  SmallDialog,
  DeltaDialogFooter,
  DeltaDialogFooterActions,
} from './DeltaDialog'
import useTranslationFunction from '../../hooks/useTranslationFunction'

import type { DialogProps } from '../../contexts/DialogContext'

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
  cb: (yes: boolean) => void
  isConfirmDanger?: boolean
  noMargin?: boolean
  header?: string
} & DialogProps) {
  const tx = useTranslationFunction()

  const onClick = (yes: boolean) => {
    onClose()
    cb(yes)
  }

  return (
    <SmallDialog onClose={onClose}>
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
            } test-selector-confirm`}
            onClick={() => onClick(true)}
          >
            {confirmLabel || tx('yes')}
          </p>
        </DeltaDialogFooterActions>
      </DeltaDialogFooter>
    </SmallDialog>
  )
}
