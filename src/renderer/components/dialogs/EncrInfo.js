const React = require('react')
const { ipcRenderer } = require('electron')
const { Classes, Dialog } = require('@blueprintjs/core')

const ContactList = require('../ContactList')

class EncrInfo extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      encrInfo: false
    }
    this.onClose = this.onClose.bind(this)
  }

  onClose () {
    this.setState({ encrInfo: false })
    this.props.onClose()
  }

  componentDidUpdate (prevProps) {
    const { chat } = this.props
    if (!chat) return
    let contacts = chat.contacts
    if (!this.state.encrInfo && contacts && contacts.length === 1) {
      this._getEncrInfoForContactId(contacts[0].id)
    }
  }

  _getEncrInfoForContactId (contactId) {
    console.log(contactId)
    const encrInfo = ipcRenderer.sendSync('dispatchSync', 'getEncrInfo', contactId)
    this.setState({ encrInfo })
  }

  _renderContactList () {
    return <ContactList
      small
      contacts={this.props.chat.contacts}
      onContactClick={(contact) => this._getEncrInfoForContactId(contact.id)}
    />
  }

  _renderEncrInfo () {
    return <pre>{this.state.encrInfo}</pre>
  }

  render () {
    const { encrInfo } = this.state
    const { chat, isOpen } = this.props
    const tx = window.translate
    return (
      <Dialog
        isOpen={isOpen}
        title={tx('encryption_info_title_desktop')}
        icon='lock'
        onClose={this.onClose}
        canOutsideClickClose={false}>
        <div className={Classes.DIALOG_BODY}>
          { encrInfo && <pre>{encrInfo}</pre>}
          { chat && chat.contacts.length > 1 && this._renderContactList()}
        </div>
      </Dialog>
    )
  }
}

module.exports = EncrInfo
