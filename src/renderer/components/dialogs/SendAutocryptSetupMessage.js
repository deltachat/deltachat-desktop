import React from 'react'
import { ipcRenderer } from 'electron'

import {
  Card,
  Callout,
  Spinner,
  Classes,
  Dialog
} from '@blueprintjs/core'
import { DeltaButton } from '../helpers/SmallDialog'
import InputTransferKey from '../helpers/AutocryptSetupMessage'

class KeyViewPanel extends React.Component {
  render () {
    const tx = window.translate
    return (
      <React.Fragment>
        <div className={Classes.DIALOG_BODY}>
          <Card>
            <Callout>{tx('show_key_transfer_message_desktop')}</Callout>
            <div className={Classes.DIALOG_BODY}>
              <InputTransferKey autocryptkey={this.props.autocryptKey.split('-')} disabled />
            </div>
          </Card>
        </div>
        <div className={Classes.DIALOG_FOOTER}>
          <div className={Classes.DIALOG_FOOTER_ACTIONS}>
            <DeltaButton onClick={this.props.onClose}>{tx('done')}</DeltaButton>
          </div>
        </div>
      </React.Fragment>
    )
  }
}

class KeyLoadingPanel extends React.Component {
  render () {
    return (
      <div className={Classes.DIALOG_BODY}>
        <Card>
          <Spinner hasValue={false} size={Spinner.SIZE_STANDARD} intent='success' />
        </Card>
      </div>
    )
  }
}

class InitiatePanel extends React.Component {
  render () {
    const tx = window.translate
    return (
      <div className={Classes.DIALOG_BODY}>
        <Card>
          <Callout>{tx('initiate_key_transfer_desktop')}</Callout>
          <DeltaButton style={{ float: 'right', marginTop: '20px' }} onClick={this.props.onClick}>{tx('ok')}</DeltaButton>
        </Card>
      </div>
    )
  }
}

export default class SendAutocryptSetupMessage extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      loading: false,
      key: false
    }
    this.onClose = this.onClose.bind(this)
    this.initiateKeyTransfer = this.initiateKeyTransfer.bind(this)
    this.initiateKeyTransferResp = this.initiateKeyTransferResp.bind(this)
  }

  initiateKeyTransferResp (e, err, key) {
    this.setState({ loading: false, key })
  }

  componentDidMount () {
    ipcRenderer.on('initiateKeyTransferResp', this.initiateKeyTransferResp)
  }

  componentWillUnmount () {
    ipcRenderer.removeListener('initiateKeyTransferResp', this.initiateKeyTransferResp)
  }

  onClose () {
    this.setState({ key: null })
    this.props.onClose()
  }

  initiateKeyTransfer () {
    ipcRenderer.send('initiateKeyTransfer')
    this.setState({ loading: true })
  }

  render () {
    const { isOpen } = this.props
    const { loading, key } = this.state
    const tx = window.translate

    let body
    if (loading) body = <KeyLoadingPanel />
    else if (key) body = <KeyViewPanel autocryptKey={key} onClose={this.onClose} />
    else body = <InitiatePanel onClick={this.initiateKeyTransfer} />
    return (
      <Dialog
        isOpen={isOpen}
        title={tx('autocrypt_key_transfer_desktop')}
        onClose={this.onClose}
        canOutsideClickClose={false}>
        {body}
      </Dialog>
    )
  }
}
