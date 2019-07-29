const React = require('react')
const { ipcRenderer } = require('electron')

const {
  Classes,
  Button,
  ButtonGroup,
  Dialog
} = require('@blueprintjs/core')

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
    const title = tx('contact_request_title_desktop')
    const body = tx('ask_start_chat_with', nameAndAddr)

    return (
      <Dialog
        isOpen={isOpen}
        title={title}
        icon='info-sign'
        onClose={this.close}
        canOutsideClickClose={false}>
        <div className='bp3-dialog-body-with-padding'>
          <h3>{body}</h3>
          <div className={Classes.DIALOG_FOOTER}>
            <div className={Classes.DIALOG_FOOTER_ACTIONS}>
              <ButtonGroup>
                <Button onClick={this.yes}> {tx('yes')} </Button>
                <Button onClick={this.close}> {tx('no')} </Button>
                <Button onClick={this.never}> {tx('never')} </Button>
              </ButtonGroup>
            </div>
          </div>
        </div>
      </Dialog>
    )
  }
}

module.exports = DeadDrop
