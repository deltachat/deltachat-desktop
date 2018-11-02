const React = require('react')
const { ipcRenderer } = require('electron')

const {
  Spinner,
  Classes,
  Button,
  ButtonGroup,
  Dialog
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
    const value = Number(event.target.value)

    if (isNaN(value) || value < 0 || value > 9999) return false
    let updatedkey = this.state.key
    updatedkey[Number(event.target.id)] = value
    this.setState({ key: updatedkey })
  }

  onClick (event) {
    const autocryptKey = this.state.key.join('')
    this.props.continueKeyTransfer(autocryptKey)
  }

  renderInputKey () {
    let inputs = []
    for (let i = 0; i < 9; i++) {
      inputs.push(
        <div className='partial' key={i}>
          <input
            key={i}
            id={i}
            type='number'
            value={this.state.key[i]}
            onChange={this.handleChangeKey}
          />
          {i !== 8 ? <div className='centered separator'>-</div> : null}
        </div>
      )
    }
    return inputs
  }

  render () {
    const tx = window.translate

    return (<div>
      {this.props.message && <h3>{this.props.message}</h3>}
      <p>
        {tx('showKeyTransferMessage')}
      </p>
      <div className='InputTransferKey'>
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
