const React = require('react')
const { ipcRenderer } = require('electron')

const {
  Spinner,
  InputGroup,
  Classes,
  Button,
  ButtonGroup,
  Dialog,
  NumericInput
} = require('@blueprintjs/core')

class SetupMessagePanel extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      key: Array(9).fill('')
    }
    this.handleChangeKey = this.handleChangeKey.bind(this)
  }

  handleChangeKey (event) {
    // TODO: insert - automatically in between every 4 characters
    // TODO: lint the value for correct setup message format
    if(event.target.value < 0 || event.target.value > 9999) {
      return false
    }
    let updatedkey = this.state.key
    updatedkey[Number(event.target.id)] = event.target.value
    this.setState({key: updatedkey})
  }

  onClick (event) {
    this.props.continueKeyTransfer(this.state.key.join(''))
  }

  renderInputKey() {
    let inputs = []
    for(let i = 0; i<9; i++) {
      inputs.push(
        <input
          type="number"
          value={this.state.key[i]}
          id={i}
          onChange={this.handleChangeKey}
          min='0'
          max='9999'
          size="4"
        />
      )

      if (i!==8) {
        inputs.push(<div class="seperator"></div>)
      }
    }
    return inputs
  }

  render () {
    const tx = window.translate
    console.log(this.state)

    return (<div>
      {this.props.message && <h3>{this.props.message}</h3>}
      <p>
        {tx('showKeyTransferMessage')}
      </p>
      <div class="InputTransferKey">
        {this.renderInputKey()}
      </div>
      <div className={Classes.DIALOG_FOOTER}>
        <div className={Classes.DIALOG_FOOTER_ACTIONS}>
          <ButtonGroup>
            <Button onClick={this.onClick.bind(this)}>{tx('transferKey')}</Button>
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
