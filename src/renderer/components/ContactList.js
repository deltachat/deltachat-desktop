const React = require('react')
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
    const { filterFunction, contacts } = this.props
    if (!contacts || contacts.length === 0) {
      return []
    }
    let data = contacts
    if (filterFunction) {
      data = contacts.filter(filterFunction)
    }
    data = data.filter(contact =>
      `${contact.name}${contact.address}${contact.displayName}`.indexOf(this.state.queryStr) !== -1
    )
    if (this.props.showVerifiedContacts) {
      data = data.filter(contact => contact.isVerified)
    }
    return data
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
