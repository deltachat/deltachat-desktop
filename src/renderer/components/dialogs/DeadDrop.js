import React from 'react'
import { callDcMethod } from '../../ipc'
import { Classes } from '@blueprintjs/core'
import SmallDialog, { DeltaButton, DeltaButtonPrimary, DeltaButtonDanger } from '../helpers/SmallDialog'

export default class DeadDrop extends React.Component {
  constructor (props) {
    super(props)
    this.yes = this.yes.bind(this)
    this.never = this.never.bind(this)
    this.close = this.close.bind(this)
  }

  yes () {
    callDcMethod('chatWithContact', [this.props.deadDrop])
    this.close()
  }

  close () {
    this.props.onClose()
  }

  never () {
    callDcMethod('blockContact', [this.props.deadDrop.contact.id])
    this.close()
  }

  render () {
    const { deadDrop } = this.props

    const isOpen = !!deadDrop
    const nameAndAddr = deadDrop && deadDrop.contact && deadDrop.contact.nameAndAddr

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
              <DeltaButtonPrimary bold={false} onClick={this.yes}>{tx('yes').toUpperCase()}</DeltaButtonPrimary>
              <DeltaButton
                bold={false}
                onClick={this.close}
                style={{ marginLeft: '115px' }}
              >
                {tx('not_now').toUpperCase()}
              </DeltaButton>
              <DeltaButtonDanger bold={false} onClick={this.never}>
                {tx('never').toUpperCase()}
              </DeltaButtonDanger>
            </div>
          </div>
        </div>
      </SmallDialog>
    )
  }
}
