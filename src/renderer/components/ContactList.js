const React = require('react')
const { ipcRenderer } = require('electron')
const C = require('deltachat-node/constants')

const { RenderContact } = require('./Contact')
const SearchInput = require('./SearchInput.js')

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
    const { childProps, onContactClick } = this.props
    const contacts = this._getContacts()
    return <div>
      <SearchInput
        onChange={this.handleSearch}
        value={this.state.queryStr}
      />
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
    </div>
  }
}
module.exports = ContactList
