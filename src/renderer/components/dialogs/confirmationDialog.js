import React, { useContext } from 'react'
import { remote } from 'electron'
import * as ScreenContext from '../../contexts/ScreenContext'  
import { Classes } from '@blueprintjs/core'
import SmallDialog, { DeltaGreenButton } from '../helpers/SmallDialog'

export function confirmationDialogLegacy (message, opts, cb) {
  if (!cb) cb = opts
  if (!opts) opts = {}
  const tx = window.translate
  var defaultOpts = {
    type: 'question',
    message: message,
    buttons: [tx('no'), tx('yes')]
  }
  remote.dialog.showMessageBox(Object.assign(defaultOpts, opts), response => {
    cb(response === 1) // eslint-disable-line
  })
}

export default function ConfirmationDialog(props) {
  const { message, cb, onClose } = props

  const isOpen = !!message
  const tx = window.translate

  const onClick = yes => {
    onClose()
    cb(yes)
  }

  return (
    <SmallDialog
      isOpen={isOpen}
      onClose={() => cb(false)}
    >
      <div className='bp3-dialog-body-with-padding'>
        <p>{message}</p>
        <div className={Classes.DIALOG_FOOTER}>
          <div
            className={Classes.DIALOG_FOOTER_ACTIONS}
            style={{ justifyContent: 'space-between', marginTop: '7px' }}
          >
            <DeltaGreenButton onClick={() => onClick(false)}>
              {tx('no').toUpperCase()}
            </DeltaGreenButton>
            <DeltaGreenButton
              onClick={() => onClick(true)}
              style={{ marginLeft: '90px' }}
            >
              {tx('yes').toUpperCase()}
            </DeltaGreenButton>
          </div>
        </div>
      </div>
    </SmallDialog>
  )
}


export function spawnConfirmationDialog(message, cb) {
  const screenContext = useContext(ScreenContext)

  screenContext.openDialog('ConfirmationDialog', {message, cb})
}
