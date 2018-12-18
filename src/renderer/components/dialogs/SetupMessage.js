const React = require('react')
const { ipcRenderer } = require('electron')
const styled = require('styled-components').default
const Centered = require('../helpers/Centered')

const {
  Spinner,
  Classes,
  Button,
  ButtonGroup,
  Dialog
} = require('@blueprintjs/core')

const InputTransferKey = styled.div`
  display: grid;
  grid-template-columns: auto auto auto;
  grid-gap: 10px;
  padding: 10px 20px 20px 10px;
`

const SetupMessagePartialInputWrapper = styled.div`
  width: 100%;

  input {
    width: 66%;
    float: left;
  }
`

const SetupMessagePartialInputSeperator = styled(Centered)`
  width: 33%;
  float: right;
`

class SetupMessagePanel extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      key: Array(9).fill('')
    }
    this.handleChangeKey = this.handleChangeKey.bind(this)
  }

  handleChangeKey (event) {
    const value = event.target.value
    const valueNumber = Number(value)
    if (value.length > 4 || isNaN(valueNumber) || valueNumber < 0 || valueNumber > 9999) return false

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
        <SetupMessagePartialInputWrapper key={i}>
          <input
            key={i}
            id={i}
            type='number'
            value={this.state.key[i]}
            onChange={this.handleChangeKey}
          />
          {i !== 8 ? <SetupMessagePartialInputSeperator>-</SetupMessagePartialInputSeperator> : null}
        </SetupMessagePartialInputWrapper>
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
      <InputTransferKey>
        {this.renderInputKey()}
      </InputTransferKey>
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

class SetupMessage extends React.Component {
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
    const isOpen = !!setupMessage

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

module.exports = SetupMessage
