const React = require('react')
const conversations = require('../conversations')
const { convertContactProps } = require('../Contact')
const {
  Classes,
  Dialog
} = require('@blueprintjs/core')

class MessageDetail extends React.Component {
  render () {
    var { chat, message, onClose } = this.props
    var isOpen = !!message

    const tx = window.translate

    let body = <div />
    if (isOpen) {
      var msg = message.msg
      msg.disableMenu = true
      msg.onDelete = message.onDelete
      let contacts
      if (message.isMe) {
        contacts = chat.contacts.map(convertContactProps)
      } else {
        contacts = [convertContactProps(message.contact)]
      }
      body = <conversations.MessageDetail
        contacts={contacts}
        status={msg.status}
        message={msg}
        sentAt={msg.sentAt}
        receivedAt={msg.receivedAt}
        i18n={window.translate}
      />
    }

    return (
      <Dialog
        isOpen={isOpen}
        title={tx('messageDetailTitle')}
        icon='info-sign'
        onClose={onClose}>
        <div className={Classes.DIALOG_BODY}>
          {body}
        </div>
      </Dialog>
    )
  }
}

module.exports = MessageDetail
