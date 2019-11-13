import React from 'react'
import { callDcMethod } from '../../ipc'
import { Classes } from '@blueprintjs/core'
import SmallDialog, { DeltaButton, DeltaButtonPrimary, DeltaButtonDanger } from './SmallDialog'

export default function DeadDrop (props) {
  const { deaddrop } = props

  const close = props.onClose
  const yes = () => {
    callDcMethod('contacts.acceptContactRequest', [deaddrop.contactId])
    close()
  }
  const never = () => {
    callDcMethod('contacts.blockContact', [deaddrop.contactId])
    close()
  }

  const nameAndAddr = deaddrop && deaddrop.nameAndAddr
  const tx = window.translate
  const body = tx('ask_start_chat_with', nameAndAddr)

  return (
    <SmallDialog
      isOpen={!!deaddrop}
      onClose={close}
    >
      <div className='bp3-dialog-body-with-padding'>
        <p>{body}</p>
        <div className={Classes.DIALOG_FOOTER}>
          <div
            className={Classes.DIALOG_FOOTER_ACTIONS}
            style={{ justifyContent: 'space-between', marginTop: '7px' }}
          >
            <DeltaButtonDanger bold={false} onClick={never}>
              {tx('never').toUpperCase()}
            </DeltaButtonDanger>
            <DeltaButton
              bold={false}
              onClick={close}
            >
              {tx('not_now').toUpperCase()}
            </DeltaButton>
            <DeltaButtonPrimary bold={false} onClick={yes}>{tx('yes').toUpperCase()}</DeltaButtonPrimary>
          </div>
        </div>
      </div>
    </SmallDialog>
  )
}
