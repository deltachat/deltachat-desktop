const React = require('react')
const { contactDetail } = require('../conversations')
const { convertContactProps } = require('../Contact')
const {
  Classes,
  Dialog
} = require('@blueprintjs/core')

class ContactDetailDialog extends React.Component {
  render () {
    var { contactId, onClose } = this.props
    var isOpen = !!contactId

    const tx = window.translate
    let body = <div />
    if (isOpen) {
      body = <div>{contactId}</div>
    }

    return (
      <Dialog
        isOpen={isOpen}
        title={tx('contactDetailTitle')}
        icon='info-sign'
        onClose={onClose}>
        <div className={Classes.DIALOG_BODY}>
          {body}
        </div>
      </Dialog>
    )
  }
}

module.exports = ContactDetailDialog
