const React = require('react')
const { ipcRenderer } = require('electron')

const {
  Classes,
  Button,
  ButtonGroup,
  Dialog
} = require('@blueprintjs/core')

class DeadDropDialog extends React.Component {
  constructor (props) {
    super(props)
    this.yes = this.yes.bind(this)
    this.never = this.never.bind(this)
    this.close = this.close.bind(this)
  }

  yes () {
    ipcRenderer.send('dispatch', 'chatWithContact', this.props.deadDrop)
    this.close()
  }

  close () {
    this.props.onClose()
  }

  never () {
    var contactId = this.props.deadDrop.contact.id
    ipcRenderer.send('dispatch', 'blockContact', contactId)
    this.close()
  }

  render () {
    const { deadDrop } = this.props
    var nameAndAddr = deadDrop && deadDrop.contact && deadDrop.contact.nameAndAddr

    const title = 'Chat request'
    const body = `Chat with ${nameAndAddr}?`
    const isOpen = !!deadDrop
    return (
      <Dialog
        isOpen={isOpen}
        title={title}
        icon='info-sign'
        onClose={this.close}
        canOutsideClickClose={false}>
        <div className={Classes.DIALOG_BODY}>
          <h2>{body}</h2>
          <div className={Classes.DIALOG_FOOTER}>
            <div className={Classes.DIALOG_FOOTER_ACTIONS}>
              <ButtonGroup>
                <Button onClick={this.yes}> Yes </Button>
                <Button onClick={this.close}> No </Button>
                <Button onClick={this.never}> Never </Button>
              </ButtonGroup>
            </div>
          </div>
        </div>
      </Dialog>
    )
  }
}

module.exports = DeadDropDialog
