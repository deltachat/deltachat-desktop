const React = require('react')
const { MessageDetail } = require('./conversations')
const { convertContactProps } = require('./Contact')
const {
  Classes,
  Dialog
} = require('@blueprintjs/core')

class MessageDetailDialog extends React.Component {
  render () {
    var { message, onDelete, onClose } = this.props
    var isOpen = !!message.msg

    const tx = window.translate

    let body = <div />
    if (isOpen) {
      var msg = message.msg
      msg.disableMenu = true
      msg.onDelete = onDelete
      body = <MessageDetail
        contacts={[convertContactProps(message.contact)]}
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

module.exports = MessageDetailDialog
