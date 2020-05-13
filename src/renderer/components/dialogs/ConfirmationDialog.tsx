import React from 'react'
import { Classes } from '@blueprintjs/core'
import { DeltaButtonPrimary, DeltaButtonDanger } from './SmallDialog'
import { MessageBoxOptions } from 'electron'
import { SmallDialog } from './DeltaDialog'

const { remote } = window.electron_functions

export function confirmationDialogLegacy(
  message: string,
  opts?: any,
  cb?: any
) {
  if (!cb) cb = opts
  if (!opts) opts = {}
  const tx = window.translate
  var defaultOpts: MessageBoxOptions = {
    type: 'question',
    message: message,
    buttons: [tx('no'), tx('yes')],
  }

  remote.dialog.showMessageBox(
    Object.assign(defaultOpts, opts),
    //@ts-ignore
    (response: number) => {
      cb(response === 1) // eslint-disable-line
    }
  )
}

export default function ConfirmationDialog(props: todo) {
  const { message, cancelLabel, confirmLabel, cb } = props

  const yesisPrimary =
    typeof props.yesIsPrimary === 'undefined' ? false : props.yesIsPrimary

  const isOpen = !!message
  const tx = window.translate
  const onClose = () => {
    props.onClose()
    // eslint-disable-next-line standard/no-callback-literal
    cb(false)
  }

  const onClick = (yes: boolean) => {
    props.onClose()
    cb(yes)
  }

  return (
    <SmallDialog isOpen={isOpen} onClose={onClose}>
      <div className='bp3-dialog-body-with-padding'>
        <p>{message}</p>
        <div className={Classes.DIALOG_FOOTER}>
          <div
            className={Classes.DIALOG_FOOTER_ACTIONS}
            style={{ justifyContent: 'space-between', marginTop: '7px' }}
          >
            {React.createElement(
              yesisPrimary ? DeltaButtonDanger : DeltaButtonPrimary,
              { noPadding: true, onClick: () => onClick(false) },
              cancelLabel || tx('cancel')
            )}
            {React.createElement(
              yesisPrimary ? DeltaButtonPrimary : DeltaButtonDanger,
              { noPadding: true, onClick: () => onClick(true) },
              confirmLabel || tx('yes')
            )}
          </div>
        </div>
      </div>
    </SmallDialog>
  )
}
