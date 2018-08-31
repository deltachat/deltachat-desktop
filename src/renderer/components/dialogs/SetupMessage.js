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

class KeyTransferDialog extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      loading: false,
      key: '',
      message: ''
    }
    this.ready = this.ready.bind(this)
    this.continueKeyTransfer = this.continueKeyTransfer.bind(this)
    this.handleChange = this.handleChange.bind(this)
  }

  ready (resp) {
    let message
    if (resp) message = 'Success!'
    else message = 'Incorrect Setup Key'
    this.setState({ loading: false, key: '', message })
  }

  continueKeyTransfer () {
    this.setState({ loading: true })
  }

  componentDidUpdate () {
    if (this.state.loading) {
      var resp = ipcRenderer.sendSync('dispatchSync', 'continueKeyTransfer', this.props.setupMessage.msg.id, this.state.key)
      this.ready(resp)
    }
  }

  handleChange (event) {
    // TODO: insert - automatically in between every 4 characters
    // TODO: lint the value for correct setup message format
    this.setState({ key: event.target.value, message: false })
  }

  render () {
    const { setupMessage, onClose } = this.props
    const { loading } = this.state
    const isOpen = setupMessage !== false

    const tx = window.translate

    return (
      <Dialog
        isOpen={isOpen}
        title='Autocrypt Key Transfer'
        icon='exchange'
        onClose={onClose}
        canOutsideClickClose={false}>
        <div className={Classes.DIALOG_BODY}>
          <h3> {this.state.message} </h3>
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
                <Button disabled={loading} onClick={this.continueKeyTransfer}> Transfer Key </Button>
              </ButtonGroup>
            </div>
          </div>
        </div>
      </Dialog>
    )
  }
}

module.exports = KeyTransferDialog
