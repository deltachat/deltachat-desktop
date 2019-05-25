const React = require('react')
const { ipcRenderer } = require('electron')
const {
  Classes,
  Dialog
} = require('@blueprintjs/core')

const ContactList = require('../ContactList')

class ForwardMessage extends React.Component {
  onContactClick (contact) {
    ipcRenderer.send(
      'EVENT_DC_FUNCTION_CALL',
      'forwardMessage',
      this.props.forwardMessage.msg.id,
      contact.id
    )
    this.props.onClose()
  }

  render () {
    const { contacts, forwardMessage, onClose } = this.props
    const tx = window.translate
    var isOpen = !!forwardMessage

    return (
      <Dialog
        isOpen={isOpen}
        title={tx('menu_forward')}
        icon='info-sign'
        onClose={onClose}>
        <div className={Classes.DIALOG_BODY}>
          <ContactList
            contacts={contacts}
            onContactClick={this.onContactClick.bind(this)}
          />
        </div>
      </Dialog>
    )
  }
}

module.exports = ForwardMessage
