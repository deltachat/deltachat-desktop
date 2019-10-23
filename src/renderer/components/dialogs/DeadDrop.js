import React from 'react'
import { callDcMethod } from '../../ipc'
import { Classes } from '@blueprintjs/core'
import SmallDialog, { DeltaButton, DeltaButtonPrimary, DeltaButtonDanger } from './SmallDialog'

export default class DeadDrop extends React.Component {
  constructor (props) {
    super(props)
    this.yes = this.yes.bind(this)
    this.never = this.never.bind(this)
    this.close = this.close.bind(this)
  }

  yes () {
    callDcMethod('contacts.acceptContactRequest', [this.props.deaddrop])
    this.close()
  }

  close () {
    this.props.onClose()
  }

  never () {
    callDcMethod('contacts.blockContact', [this.props.deaddrop.contact.id])
    this.close()
  }

  render () {
    const { deaddrop } = this.props

    const isOpen = !!deaddrop
    const nameAndAddr = deaddrop && deaddrop.contact && deaddrop.contact.nameAndAddr

    const tx = window.translate
    const body = tx('ask_start_chat_with', nameAndAddr)

    return (
      <SmallDialog
        isOpen={isOpen}
        onClose={this.close}
      >
        <div className='bp3-dialog-body-with-padding'>
          <p>{body}</p>
          <div className={Classes.DIALOG_FOOTER}>
            <div
              className={Classes.DIALOG_FOOTER_ACTIONS}
              style={{ justifyContent: 'space-between', marginTop: '7px' }}
            >
              <DeltaButtonDanger bold={false} onClick={this.never}>
                {tx('never').toUpperCase()}
              </DeltaButtonDanger>
              <DeltaButton
                bold={false}
                onClick={this.close}
              >
                {tx('not_now').toUpperCase()}
              </DeltaButton>
              <DeltaButtonPrimary bold={false} onClick={this.yes}>{tx('yes').toUpperCase()}</DeltaButtonPrimary>
            </div>
          </div>
        </div>
      </SmallDialog>
    )
  }
}
