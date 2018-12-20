const React = require('react')
const { ipcRenderer } = require('electron')
const styled = require('styled-components').default
const Centered = require('../helpers/Centered')

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

const SetupMessagePartialInputSeperator = styled(Centered)`
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
    this.state = {
      key: props.autocryptKey
    }
    this.handleChangeKey = this.handleChangeKey.bind(this)
  }

  handleChangeKey (event) {
    const value = event.target.value
    const valueNumber = Number(value)
    if (value.length > 4 || isNaN(valueNumber) || valueNumber < 0 || valueNumber > 9999) return false

    let updatedkey = this.state.key
    var index = Number(event.target.getAttribute('data-index'))
    updatedkey[index] = value
    this.setState({ key: updatedkey })
    if (value.length === 4) {
      var next = index += 1
      if (next <= 8) document.getElementById('autocrypt-input-' + next).focus()
    }
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
          <InputGroup
            key={i}
            data-index={i}
            id={'autocrypt-input-' + i}
            type='number'
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
        {tx('autocryptEnterMessage')}
      </Card>
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
      autocryptKey: Array(9).fill(''),
      loading: false
    }
    this.continueKeyTransfer = this.continueKeyTransfer.bind(this)
    this.continueKeyTransferResp = this.continueKeyTransferResp.bind(this)
  }

  continueKeyTransferResp (e, err) {
    const tx = window.translate
    if (err) {
      this.setState({ loading: false })
      this.props.userFeedback({ type: 'error', text: tx('autocryptIncorrect') })
    } else {
      this.setState({ loading: false })
      this.props.userFeedback({ type: 'success', text: tx('autocryptCorrect') })
      this.onClose()
    }
  }

  componentDidMount () {
    ipcRenderer.on('continueKeyTransferResp', this.continueKeyTransferResp)
  }

  componentDidUpdate (prevProps) {
    if (!prevProps || (!prevProps.setupMessage && this.props.setupMessage)) {
      this.setState({ autocryptKey: Array(9).fill('') })
    }
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
    const { autocryptKey, loading } = this.state
    const isOpen = !!setupMessage

    let body
    if (loading) {
      body = <div>
        <Spinner size={50} intent='success' />
      </div>
    } else {
      body = <SetupMessagePanel
        autocryptKey={autocryptKey}
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
