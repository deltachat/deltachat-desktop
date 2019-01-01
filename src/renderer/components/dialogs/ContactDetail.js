const React = require('react')

const {
  Classes,
  Dialog
} = require('@blueprintjs/core')

class ContactDetail extends React.Component {
  render () {
    const { contactId, onClose } = this.props
    const isOpen = !!contactId

    const tx = window.translate
    const body = isOpen ? <div>{contactId}</div> : <div />

    return (
      <Dialog
        isOpen={isOpen}
        title={tx('contact_detail_title_desktop')}
        icon='info-sign'
        onClose={onClose}>
        <div className={Classes.DIALOG_BODY}>
          {body}
        </div>
      </Dialog>
    )
  }
}

module.exports = ContactDetail
