import React from 'react'
const { ipcRenderer } = window.electron_functions
import { DeltaButtonPrimary } from './SmallDialog'
import {
  Card,
  Callout,
  Spinner,
  Classes
} from '@blueprintjs/core'
import InputTransferKey from './AutocryptSetupMessage'
import DeltaDialog from './DeltaDialog'

class SetupMessagePanel extends React.Component {
  constructor (props) {
    super(props)
    this.state = { key: Array(9).fill('') }
    this.state.key[0] = props.setupCodeBegin
    this.handleChangeKey = this.handleChangeKey.bind(this)
  }

  handleChangeKey (event) {
    const value = event.target.value
    const valueNumber = Number(value)
    if (value.length > 4 || isNaN(valueNumber) || valueNumber < 0 || valueNumber > 9999) return false

    const updatedkey = this.state.key
    let index = Number(event.target.getAttribute('data-index'))
    updatedkey[index] = value
    this.setState({ key: updatedkey })
    if (value.length === 4) {
      const next = index += 1
      if (next <= 8) document.getElementById('autocrypt-input-' + next).focus()
    }
  }

  onClick () {
    this.props.continueKeyTransfer(this.state.key.join(''))
  }

  render () {
    const tx = window.translate

    return (
      <React.Fragment>
        <div className={Classes.DIALOG_BODY}>
          <Card>
            <Callout>{tx('autocrypt_continue_transfer_please_enter_code')}</Callout>
            <InputTransferKey autocryptkey={this.state.key} onChange={this.handleChangeKey} />
          </Card>
        </div>
        <div className={Classes.DIALOG_FOOTER}>
          <div className={Classes.DIALOG_FOOTER_ACTIONS}>
            <DeltaButtonPrimary onClick={this.onClick.bind(this)}>{tx('ok')}</DeltaButtonPrimary>
          </div>
        </div>
      </React.Fragment>
    )
  }
}

export default class EnterAutocryptSetupMessage extends React.Component {
  constructor (props) {
    super(props)
    this.state = { loading: false }
    this.continueKeyTransfer = this.continueKeyTransfer.bind(this)
    this.continueKeyTransferResp = this.continueKeyTransferResp.bind(this)
  }

  continueKeyTransferResp (e, err) {
    const tx = window.translate
    if (err) {
      this.setState({ loading: false })
      this.props.userFeedback({ type: 'error', text: tx('autocrypt_incorrect_desktop') })
    } else {
      this.setState({ loading: false })
      this.props.userFeedback({ type: 'success', text: tx('autocrypt_correct_desktop') })
      this.props.onClose()
    }
  }

  componentDidMount () {
    ipcRenderer.on('continueKeyTransferResp', this.continueKeyTransferResp)
  }

  componentWillUnmount () {
    ipcRenderer.removeListener('continueKeyTransferResp', this.continueKeyTransferResp)
  }

  continueKeyTransfer (key) {
    this.setState({ key, loading: true })
    ipcRenderer.send('continueKeyTransfer', this.props.message.msg.id, key)
  }

  render () {
    const { message, onClose } = this.props
    const { loading } = this.state
    const isOpen = !!message
    const tx = window.translate

    const setupCodeBegin = message && message.setupCodeBegin

    let body
    if (loading) {
      body = <div className={Classes.DIALOG_BODY}><Spinner /></div>
    } else {
      body = <SetupMessagePanel
        setupCodeBegin={setupCodeBegin}
        continueKeyTransfer={this.continueKeyTransfer} />
    }

    return (
      <DeltaDialog
        isOpen={isOpen}
        title={tx('autocrypt_key_transfer_desktop')}
        onClose={onClose}
        canOutsideClickClose={false}>
        {body}
      </DeltaDialog>
    )
  }
}
