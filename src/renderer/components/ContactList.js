const React = require('react')
const { ipcRenderer } = require('electron')
const C = require('deltachat-node/constants')
const styled = require('styled-components').default

const { RenderContact } = require('./Contact')
const SearchInput = require('./SearchInput.js')

const ContactListDiv = styled.div`
  max-height: 400px;
  overflow: scroll;
  margin-top: 10px;
  border: 1px solid darkgrey;
  .module-contact-list-item--with-click-handler {
    padding: 10px;
  }
  .module-contact-list-item--with-click-handler:hover {
    background-color: darkgrey;
  }
`

class ContactList extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      queryStr: '',
      showVerifiedContacts: false
    }
    this.handleSearch = this.handleSearch.bind(this)
    this.search = this.search.bind(this)
  }

  handleSearch (event) {
    this.search(event.target.value)
  }

  search (queryStr) {
    this.setState({ queryStr })
  }

  componentDidMount () {
    this.search('')
  }

  _getContacts () {
    const listFlags = this.state.showVerifiedContacts ? C.DC_GCL_VERIFIED_ONLY : 0
    const contacts = ipcRenderer.sendSync(
      'dispatchSync', 'getContacts', listFlags, this.state.queryStr
    )
    return contacts
  }

  render () {
    const { childProps, onContactClick, filter } = this.props
    let contacts = this.props.contacts
    if (!contacts) contacts = this._getContacts()
    if (filter) contacts = contacts.filter(filter)
    return <div>
      <SearchInput
        onChange={this.handleSearch}
        value={this.state.queryStr}
      />
      <ContactListDiv>
        {contacts.map((contact) => {
          var props = childProps ? childProps(contact) : {}
          return (
            <RenderContact
              key={contact.id}
              onClick={() => onContactClick(contact)}
              contact={contact}
              {...props}
            />
          )
        })}
      </ContactListDiv>
    </div>
  }
}
module.exports = ContactList
