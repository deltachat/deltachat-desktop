import React from 'react'  
import { ipcRenderer } from 'electron'
import { Classes } from '@blueprintjs/core'
import SmallDialog, { DeltaGreenButton } from '../helpers/SmallDialog'


export default class DeadDrop extends React.Component {
  constructor (props) {
    super(props)
    this.yes = this.yes.bind(this)
    this.never = this.never.bind(this)
    this.close = this.close.bind(this)
  }

  yes () {
    ipcRenderer.send('EVENT_DC_FUNCTION_CALL', 'chatWithContact', this.props.deadDrop)
    this.close()
  }

  close () {
    this.props.onClose()
  }

  never () {
    ipcRenderer.send('EVENT_DC_FUNCTION_CALL', 'blockContact', this.props.deadDrop.contact.id)
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
              <DeltaGreenButton onClick={this.never}>
                {tx('never').toUpperCase()}
              </DeltaGreenButton>
              <DeltaGreenButton
                onClick={this.close}
                style={{ marginLeft: '90px' }}
              >
                {tx('not_now').toUpperCase()}
              </DeltaGreenButton>
              <DeltaGreenButton onClick={this.yes}>{tx('ok').toUpperCase()}</DeltaGreenButton>
            </div>
          </div>
        </div>
      </SmallDialog>
    )
  }
}
