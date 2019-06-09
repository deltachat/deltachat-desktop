const React = require('react')
const { ipcRenderer } = require('electron')
const C = require('deltachat-node/constants')
const styled = require('styled-components').default
const SearchableList = require('./SearchableList')
const contactsStore = require('../stores/contacts')

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
    this.filterContactList = this.filterContactList.bind(this)
  }

  filterContactList (contactsState) {
    const { contacts } = contactsState
    const { filterFunction } = this.props
    let data = contacts
    if (filterFunction) {
      data = contacts.filter(filterFunction)
    }
    this.setState({ data })
  }

  componentDidMount () {
    contactsStore.subscribe(this.filterContactList)
    this.search()
  }

  componentWillUnmount () {
    contactsStore.unsubscribe(this.filterContactList)
  }

  search () {
    const listFlags = this.props.showVerifiedContacts ? C.DC_GCL_VERIFIED_ONLY : 0
    ipcRenderer.send(
      'EVENT_DC_FUNCTION_CALL',
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
