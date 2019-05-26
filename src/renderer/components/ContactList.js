const React = require('react')
const { ipcRenderer } = require('electron')
const C = require('deltachat-node/constants')
const styled = require('styled-components').default
const SearchableList = require('./SearchableList')

const { RenderContact } = require('./Contact')

const ContactListDiv = styled.div`
  .module-contact-list-item--with-click-handler {
    padding: 10px;
  }
  .module-contact-list-item--with-click-handler:hover {
    background-color: darkgrey;
  }
`

class ContactList extends SearchableList {
  constructor (props) {
    super(props)
    this.state.showVerifiedContacts = false
    this.handleSearch = this.handleSearch.bind(this)
    this.search = this.search.bind(this)
  }

  _getData () {
    if (this.props.contacts) {
      return this.props.contacts.filter(contact =>
        `${contact.name}${contact.address}${contact.displayName}`.indexOf(this.state.queryStr) !== -1
      )
    }
    const listFlags = this.props.showVerifiedContacts ? C.DC_GCL_VERIFIED_ONLY : 0
    return ipcRenderer.sendSync(
      'getContacts',
      listFlags,
      this.state.queryStr
    )
  }

  render () {
    return <ContactListDiv>{super.render()}</ContactListDiv>
  }

  renderItem (contact) {
    const { childProps, onContactClick } = this.props
    const props = childProps ? childProps(contact) : {}
    return <RenderContact
      key={contact.id}
      onClick={() => onContactClick(contact)}
      contact={contact}
      {...props}
    />
  }
}
module.exports = ContactList
