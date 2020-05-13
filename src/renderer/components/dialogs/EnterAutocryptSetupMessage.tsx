import React from 'react'
import { DeltaButtonPrimary } from './SmallDialog'
import { Card, Callout, Spinner, Classes } from '@blueprintjs/core'
import InputTransferKey from './AutocryptSetupMessage'
import DeltaDialog from './DeltaDialog'
import { ScreenContext } from '../../contexts'
import { DialogProps } from '.'
import { MessageType } from '../../../shared/shared-types'
const { ipcRenderer } = window.electron_functions

type SetupMessagePanelProps = Readonly<{
  setupCodeBegin: string
  continueKeyTransfer: typeof EnterAutocryptSetupMessage.prototype.continueKeyTransfer
}>

class SetupMessagePanel extends React.Component<
  SetupMessagePanelProps,
  { key: string[] }
> {
  constructor(props: SetupMessagePanelProps) {
    super(props)
    this.state = { key: Array(9).fill('') }
    this.state.key[0] = props.setupCodeBegin
    this.handleChangeKey = this.handleChangeKey.bind(this)
  }

  handleChangeKey(
    event: React.FormEvent<HTMLElement> & React.ChangeEvent<HTMLInputElement>
  ) {
    const value = event.target.value
    const valueNumber = Number(value)
    if (
      value.length > 4 ||
      isNaN(valueNumber) ||
      valueNumber < 0 ||
      valueNumber > 9999
    )
      return false

    const updatedkey = this.state.key
    let index = Number(event.target.getAttribute('data-index'))
    updatedkey[index] = value
    this.setState({ key: updatedkey })
    if (value.length === 4) {
      const next = (index += 1)
      if (next <= 8) document.getElementById('autocrypt-input-' + next).focus()
    }
  }

  onClick() {
    this.props.continueKeyTransfer(this.state.key.join(''))
  }

  render() {
    const tx = window.translate

    return (
      <React.Fragment>
        <div className={Classes.DIALOG_BODY}>
          <Card>
            <Callout>
              {tx('autocrypt_continue_transfer_please_enter_code')}
            </Callout>
            <InputTransferKey
              autocryptkey={this.state.key}
              onChange={this.handleChangeKey}
            />
          </Card>
        </div>
        <div className={Classes.DIALOG_FOOTER}>
          <div className={Classes.DIALOG_FOOTER_ACTIONS}>
            <DeltaButtonPrimary onClick={this.onClick.bind(this)}>
              {tx('ok')}
            </DeltaButtonPrimary>
          </div>
        </div>
      </React.Fragment>
    )
  }
}

type EnterAutocryptSetupMessageProps = Readonly<{
  onClose: DialogProps['onClose']
  message: MessageType
}>

export default class EnterAutocryptSetupMessage extends React.Component<
  EnterAutocryptSetupMessageProps,
  { loading: boolean; key: string }
> {
  static contextType = ScreenContext
  declare context: React.ContextType<typeof ScreenContext>
  constructor(props: EnterAutocryptSetupMessageProps) {
    super(props)
    this.state = { loading: false, key: undefined }
    this.continueKeyTransfer = this.continueKeyTransfer.bind(this)
    this.continueKeyTransferResp = this.continueKeyTransferResp.bind(this)
  }

  continueKeyTransferResp(e: any, err: Error) {
    const tx = window.translate
    if (err) {
      this.setState({ loading: false })
      this.context.userFeedback({
        type: 'error',
        text: tx('autocrypt_incorrect_desktop'),
      })
    } else {
      this.setState({ loading: false })
      this.context.userFeedback({
        type: 'success',
        text: tx('autocrypt_correct_desktop'),
      })
      this.props.onClose()
    }
  }

  componentDidMount() {
    ipcRenderer.on('continueKeyTransferResp', this.continueKeyTransferResp)
  }

  componentWillUnmount() {
    ipcRenderer.removeListener(
      'continueKeyTransferResp',
      this.continueKeyTransferResp
    )
  }

  continueKeyTransfer(key: string) {
    this.setState({ key, loading: true })
    ipcRenderer.send('continueKeyTransfer', this.props.message.msg.id, key)
  }

  render() {
    const { message, onClose } = this.props
    const { loading } = this.state
    const isOpen = !!message
    const tx = window.translate

    const setupCodeBegin = message && message.setupCodeBegin

    let body
    if (loading) {
      body = (
        <div className={Classes.DIALOG_BODY}>
          <Spinner />
        </div>
      )
    } else {
      body = (
        <SetupMessagePanel
          setupCodeBegin={setupCodeBegin}
          continueKeyTransfer={this.continueKeyTransfer}
        />
      )
    }

    return (
      <DeltaDialog
        isOpen={isOpen}
        title={tx('autocrypt_key_transfer_desktop')}
        onClose={onClose}
        canOutsideClickClose={false}
      >
        {body}
      </DeltaDialog>
    )
  }
}
