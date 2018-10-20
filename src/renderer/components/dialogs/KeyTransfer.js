const React = require('react')
const { ipcRenderer } = require('electron')

const {
  Spinner,
  Classes,
  Button,
  ButtonGroup,
  Dialog
} = require('@blueprintjs/core')

class KeyViewPanel extends React.Component {
  render () {
    const { autocryptKey } = this.props
    const tx = window.translate
    return (
      <div>
        <p>{tx('showKeyTransferMessage')}</p>
        <p>{autocryptKey}</p>
        <div className={Classes.DIALOG_FOOTER}>
          <div className={Classes.DIALOG_FOOTER_ACTIONS}>
            <ButtonGroup>
              <Button onClick={this.props.onClose}>{tx('done')}</Button>
            </ButtonGroup>
          </div>
        </div>
      </div>
    )
  }
}

class KeyLoadingPanel extends React.Component {
  render () {
    return <div>
      <Spinner hasValue={false} size={Spinner.SIZE_STANDARD} intent='success' />
    </div>
  }
}

class InitiatePanel extends React.Component {
  render () {
    const tx = window.translate
    return (
      <div>
        <p>{tx('initiateKeyTransfer')}</p>
        <ButtonGroup>
          <Button onClick={this.props.onClick} text={tx('initiateKeyTransferTitle')} />
        </ButtonGroup>
      </div>
    )
  }
}

class KeyTransferDialog extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      loading: false,
      key: false
    }
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

  initiateKeyTransfer () {
    ipcRenderer.send('initiateKeyTransfer')
    this.setState({ loading: true })
  }

  render () {
    const { isOpen, onClose } = this.props
    const { loading, key } = this.state
    const tx = window.translate

    let body
    if (loading) body = <KeyLoadingPanel />
    else if (key) body = <KeyViewPanel autocryptKey={key} onClose={onClose} />
    else body = <InitiatePanel onClick={this.initiateKeyTransfer} />
    return (
      <Dialog
        isOpen={isOpen}
        title={tx('autocryptKeyTransfer')}
        icon='exchange'
        onClose={onClose}
        canOutsideClickClose={false}>
        <div className={Classes.DIALOG_BODY}>
          {body}
        </div>
      </Dialog>
    )
  }
}

module.exports = KeyTransferDialog
