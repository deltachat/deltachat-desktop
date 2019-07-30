const React = require('react')
const { ipcRenderer } = require('electron')

const {
  Classes,
  Dialog
} = require('@blueprintjs/core')

const styled = require('styled-components').default
const { createGlobalStyle } = require('styled-components')

const SmallDialogWrapper = createGlobalStyle`
  .bp3-small-dialog {
    background: #ffffff;
    width: 350px;
    padding-bottom: 0px;
  }
`

const DeltaGreenNoBorderButton = styled.p`
  color: #53948c;
  padding: 0px 7px;
  margin-bottom: 0px;
  &:hover {
    cursor: pointer;
  }

`

function SmallDialog (props) {
  return (
    <React.Fragment>
      <SmallDialogWrapper />
      <Dialog
        isOpen={props.isOpen}
        onClose={props.onClose}
        canOutsideClickClose
        isCloseButtonShown={false}
        className='bp3-small-dialog'
      >
        {props.children}
      </Dialog>
    </React.Fragment>
  )
}

class DeadDrop extends React.Component {
  constructor (props) {
    super(props)
    this.yes = this.yes.bind(this)
    this.never = this.never.bind(this)
    this.close = this.close.bind(this)
  }

  yes () {
    ipcRenderer.send('EVENT_DC_FUNCTION_CALL', 'chatWithContact', this.props.deadDrop)
    this.close()
  }

  close () {
    this.props.onClose()
  }

  never () {
    ipcRenderer.send('EVENT_DC_FUNCTION_CALL', 'blockContact', this.props.deadDrop.contact.id)
    this.close()
  }

  render () {
    const { deadDrop } = this.props

    const isOpen = !!deadDrop
    const nameAndAddr = deadDrop && deadDrop.contact && deadDrop.contact.nameAndAddr

    const tx = window.translate
    const body = tx('ask_start_chat_with', nameAndAddr)

    return (
      <SmallDialog
        isOpen={isOpen}
        onClose={this.close}
      >
        <div className='bp3-dialog-body-with-padding'>
          <p>{body}</p>
          <div className={Classes.DIALOG_FOOTER}>
            <div
              className={Classes.DIALOG_FOOTER_ACTIONS}
              style={{ justifyContent: 'space-between', marginTop: '7px' }}

            >
              <DeltaGreenNoBorderButton
                onClick={this.never}
              >
                {tx('never').toUpperCase()}
              </DeltaGreenNoBorderButton>
              <DeltaGreenNoBorderButton
                onClick={this.close}
                style={{ marginLeft: '90px' }}
              >
                {tx('not_now').toUpperCase()}
              </DeltaGreenNoBorderButton>
              <DeltaGreenNoBorderButton onClick={this.yes}> {tx('ok').toUpperCase()} </DeltaGreenNoBorderButton>
            </div>
          </div>
        </div>
      </SmallDialog>
    )
  }
}

module.exports = DeadDrop
