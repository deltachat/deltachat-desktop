const React = require('react')
const { ipcRenderer } = require('electron')
const styled = require('styled-components').default

const {
  Card,
  Icon,
  Spinner,
  Classes,
  Button,
  ButtonGroup,
  Dialog,
  InputGroup
} = require('@blueprintjs/core')

const InputTransferKey = styled.div`
  display: grid;
  grid-template-columns: auto auto auto;
  grid-gap: 10px;
  padding: 20px 10px 20px 30px;
`

const SetupMessagePartialInputWrapper = styled.div`
  width: 100%;

  .bp3-input {
    width: 66%;
    float: left;
  }
`

const SetupMessagePartialInputSeperator = styled.div`
  width: 20%;
  float: right;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 30px;
`

class SetupMessagePanel extends React.Component {
  constructor (props) {
    super(props)
    this.state = { key: Array(9).fill('') }
    this.state.key[0] = props.setupCodeBegin
    this.handleChangeKey = this.handleChangeKey.bind(this)
  }

  handleChangeKey (event) {
    const value = event.target.value
    const valueNumber = Number(value)
    if (value.length > 4 || isNaN(valueNumber) || valueNumber < 0 || valueNumber > 9999) return false

    const updatedkey = this.state.key
    let index = Number(event.target.getAttribute('data-index'))
    updatedkey[index] = value
    this.setState({ key: updatedkey })
    if (value.length === 4) {
      const next = index += 1
      if (next <= 8) document.getElementById('autocrypt-input-' + next).focus()
    }
  }

  onClick () {
    this.props.continueKeyTransfer(this.state.key.join(''))
  }

  renderInputKey () {
    const inputs = []
    for (let i = 0; i < 9; i++) {
      inputs.push(
        <SetupMessagePartialInputWrapper key={i}>
          <InputGroup
            key={i}
            data-index={i}
            id={'autocrypt-input-' + i}
            value={this.state.key[i]}
            onChange={this.handleChangeKey}
          />
          {i !== 8 &&
          i !== 2 &&
          i !== 5 &&
            <SetupMessagePartialInputSeperator><Icon icon='small-minus' /></SetupMessagePartialInputSeperator>}
        </SetupMessagePartialInputWrapper>
      )
    }
    return inputs
  }

  render () {
    const tx = window.translate

    return (<div>
      <Card>
        {tx('autocrypt_continue_transfer_please_enter_code')}
      </Card>
      <InputTransferKey>
        {this.renderInputKey()}
      </InputTransferKey>
      <div className={Classes.DIALOG_FOOTER}>
        <div className={Classes.DIALOG_FOOTER_ACTIONS}>
          <ButtonGroup>
            <Button onClick={this.onClick.bind(this)}>{tx('transfer_key_desktop')}</Button>
          </ButtonGroup>
        </div>
      </div>
    </div>)
  }
}

class SetupMessage extends React.Component {
  constructor (props) {
    super(props)
    this.state = { loading: false }
    this.continueKeyTransfer = this.continueKeyTransfer.bind(this)
    this.continueKeyTransferResp = this.continueKeyTransferResp.bind(this)
  }

  continueKeyTransferResp (e, err) {
    const tx = window.translate
    if (err) {
      this.setState({ loading: false })
      this.props.userFeedback({ type: 'error', text: tx('autocrypt_incorrect_desktop') })
    } else {
      this.setState({ loading: false })
      this.props.userFeedback({ type: 'success', text: tx('autocrypt_correct_desktop') })
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
    this.setState({ key, loading: true })
    ipcRenderer.send('continueKeyTransfer', this.props.setupMessage.msg.id, key)
  }

  render () {
    const { setupMessage, onClose } = this.props
    const { loading } = this.state
    const isOpen = !!setupMessage
    const tx = window.translate

    const setupCodeBegin = setupMessage && setupMessage.setupCodeBegin

    let body
    if (loading) {
      body = <div>
        <Spinner size={50} intent='success' />
      </div>
    } else {
      body = <SetupMessagePanel
        setupCodeBegin={setupCodeBegin}
        continueKeyTransfer={this.continueKeyTransfer} />
    }

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

module.exports = SetupMessage
