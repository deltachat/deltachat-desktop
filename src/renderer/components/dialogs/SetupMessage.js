const React = require('react')
const { ipcRenderer } = require('electron')

const {
  Spinner,
  InputGroup,
  Classes,
  Button,
  ButtonGroup,
  Dialog
} = require('@blueprintjs/core')

class SetupMessagePanel extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      key: ''
    }
    this.handleChange = this.handleChange.bind(this)
  }

  handleChange (event) {
    // TODO: insert - automatically in between every 4 characters
    // TODO: lint the value for correct setup message format
    this.setState({ key: event.target.value, message: false })
  }

  onClick (event) {
    this.props.continueKeyTransfer(this.state.key)
  }

  render () {
    const tx = window.translate

    return (<div>
      {this.props.message && <h3>{this.props.message}</h3>}
      <p>
        {tx('showKeyTransferMessage')}
      </p>
      <InputGroup
        onChange={this.handleChange}
        value={this.state.key}
      />
      <div className={Classes.DIALOG_FOOTER}>
        <div className={Classes.DIALOG_FOOTER_ACTIONS}>
          <ButtonGroup>
            <Button onClick={this.onClick.bind(this)}> Transfer Key </Button>
          </ButtonGroup>
        </div>
      </div>
    </div>)
  }
}

class KeyTransferDialog extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      loading: false,
      message: ''
    }
    this.continueKeyTransfer = this.continueKeyTransfer.bind(this)
    this.continueKeyTransferResp = this.continueKeyTransferResp.bind(this)
  }

  continueKeyTransferResp (e, err) {
    let message
    if (err) {
      message = 'Incorrect Setup Key'
      this.setState({ loading: false, message })
    } else {
      this.setState({ loading: false })
      this.props.userFeedback({ type: 'success', text: 'Successfully transferred key.' })
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
    this.setState({ loading: true })
    ipcRenderer.send('continueKeyTransfer', this.props.setupMessage.msg.id, key)
  }

  render () {
    const { setupMessage, onClose } = this.props
    const { loading } = this.state
    const isOpen = setupMessage !== false

    let body
    if (loading) body = <Spinner size={50} intent='success' />
    else {
      body = <SetupMessagePanel
        message={this.state.message}
        continueKeyTransfer={this.continueKeyTransfer} />
    }

    return (
      <Dialog
        isOpen={isOpen}
        title='Autocrypt Key Transfer'
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
