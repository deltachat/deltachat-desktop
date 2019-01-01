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
  formatAutocryptKey (autocryptKey) {
    const splittedAutocryptKey = autocryptKey.split('-')
    return splittedAutocryptKey.map((e, i) => {
      const isLast = (i + 1) === splittedAutocryptKey.length
      const isNThird = (i + 1) % 3 === 0

      const addLineBreak = !isLast && isNThird
      const addDash = !isLast

      return e + (addDash ? ' - ' : '') + (addLineBreak ? '\n' : '')
    }).join('')
  }

  render () {
    const formattedAutocryptKey = this.formatAutocryptKey(this.props.autocryptKey)

    const tx = window.translate
    return (
      <div>
        <p>{tx('show_key_transfer_message_desktop')}</p>
        <pre>{formattedAutocryptKey}</pre>
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
        <p>{tx('initiate_key_transfer_desktop')}</p>
        <ButtonGroup>
          <Button onClick={this.props.onClick} text={tx('initiate_key_transfer_title_desktop')} />
        </ButtonGroup>
      </div>
    )
  }
}

class KeyTransfer extends React.Component {
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
        title={tx('autocrypt_key_transfer_desktop')}
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

module.exports = KeyTransfer
