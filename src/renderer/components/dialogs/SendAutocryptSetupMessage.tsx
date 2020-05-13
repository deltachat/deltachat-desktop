import React from 'react'

import { Card, Callout, Spinner, Classes } from '@blueprintjs/core'
import InputTransferKey from './AutocryptSetupMessage'
import DeltaDialog from './DeltaDialog'
import { DialogProps } from '.'
const { ipcRenderer } = window.electron_functions

class KeyViewPanel extends React.Component<{
  onClose: DialogProps['onClose']
  autocryptKey: string
}> {
  render() {
    const tx = window.translate
    return (
      <React.Fragment>
        <div className={Classes.DIALOG_BODY}>
          <Card>
            <Callout>{tx('show_key_transfer_message_desktop')}</Callout>
            <div className={Classes.DIALOG_BODY}>
              <InputTransferKey
                autocryptkey={this.props.autocryptKey.split('-')}
                disabled
              />
            </div>
          </Card>
        </div>
        <div className={Classes.DIALOG_FOOTER}>
          <div className={Classes.DIALOG_FOOTER_ACTIONS}>
            <p className='delta-button bold' onClick={this.props.onClose}>
              {tx('done')}
            </p>
          </div>
        </div>
      </React.Fragment>
    )
  }
}

class KeyLoadingPanel extends React.Component {
  render() {
    return (
      <div className={Classes.DIALOG_BODY}>
        <Card>
          <Spinner />
        </Card>
      </div>
    )
  }
}

class InitiatePanel extends React.Component<{
  onClick: todo
}> {
  render() {
    const tx = window.translate
    return (
      <div className={Classes.DIALOG_BODY}>
        <Card>
          <Callout>{tx('initiate_key_transfer_desktop')}</Callout>
          <p
            className='delta-button bold'
            style={{ float: 'right', marginTop: '20px' }}
            onClick={this.props.onClick}
          >
            {tx('ok')}
          </p>
        </Card>
      </div>
    )
  }
}

type SendAutocryptSetupMessageProps = Readonly<{
  onClose: DialogProps['onClose']
  isOpen: DialogProps['isOpen']
}>

export default class SendAutocryptSetupMessage extends React.Component<
  SendAutocryptSetupMessageProps,
  { loading: boolean; key: string }
> {
  constructor(props: SendAutocryptSetupMessageProps) {
    super(props)
    this.state = {
      loading: false,
      key: null,
    }
    this.onClose = this.onClose.bind(this)
    this.initiateKeyTransfer = this.initiateKeyTransfer.bind(this)
    this.initiateKeyTransferResp = this.initiateKeyTransferResp.bind(this)
  }

  initiateKeyTransferResp(e: any, err: any, key: string) {
    this.setState({ loading: false, key })
  }

  componentDidMount() {
    ipcRenderer.on('initiateKeyTransferResp', this.initiateKeyTransferResp)
  }

  componentWillUnmount() {
    ipcRenderer.removeListener(
      'initiateKeyTransferResp',
      this.initiateKeyTransferResp
    )
  }

  onClose() {
    this.setState({ key: null })
    this.props.onClose()
  }

  initiateKeyTransfer() {
    ipcRenderer.send('initiateKeyTransfer')
    this.setState({ loading: true })
  }

  render() {
    const { isOpen } = this.props
    const { loading, key } = this.state
    const tx = window.translate

    let body
    if (loading) body = <KeyLoadingPanel />
    else if (key)
      body = <KeyViewPanel autocryptKey={key} onClose={this.onClose} />
    else body = <InitiatePanel onClick={this.initiateKeyTransfer} />
    return (
      <DeltaDialog
        isOpen={isOpen}
        title={tx('autocrypt_key_transfer_desktop')}
        onClose={this.onClose}
        canOutsideClickClose={false}
      >
        {body}
      </DeltaDialog>
    )
  }
}
