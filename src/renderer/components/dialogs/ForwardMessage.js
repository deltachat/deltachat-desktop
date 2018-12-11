const React = require('react')
const { ipcRenderer } = require('electron')
const {
  Classes,
  Dialog
} = require('@blueprintjs/core')

const ContactList = require('../ContactList')

class ForwardMessageDialog extends React.Component {
  onContactClick (contact) {
    ipcRenderer.send('dispatch',
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
        title={tx('forwardMessageTitle')}
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

module.exports = ForwardMessageDialog
