import React from 'react'
import { Classes } from '@blueprintjs/core'
import SmallDialog, {
  DeltaButtonPrimary,
  DeltaButtonDanger,
} from './SmallDialog'
const { remote } = window.electron_functions

export function confirmationDialogLegacy(message, opts, cb) {
  if (!cb) cb = opts
  if (!opts) opts = {}
  const tx = window.translate
  var defaultOpts = {
    type: 'question',
    message: message,
    buttons: [tx('no'), tx('yes')],
  }
  remote.dialog.showMessageBox(Object.assign(defaultOpts, opts), response => {
    cb(response === 1) // eslint-disable-line
  })
}

export default function ConfirmationDialog(props) {
  const { message, cancelLabel, confirmLabel, cb } = props

  const isOpen = !!message
  const tx = window.translate
  const onClose = () => {
    props.onClose()
    // eslint-disable-next-line standard/no-callback-literal
    cb(false)
  }

  const onClick = yes => {
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
            <DeltaButtonPrimary noPadding onClick={() => onClick(false)}>
              {cancelLabel || tx('cancel')}
            </DeltaButtonPrimary>
            <DeltaButtonDanger noPadding onClick={() => onClick(true)}>
              {tx('save_desktop')}
            </DeltaButtonDanger>
          </div>
        </div>
      </div>
    </SmallDialog>
  )
}
