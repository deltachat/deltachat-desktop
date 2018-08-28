const React = require('react')
const {ipcRenderer} = require('electron')

const Back = require('./back')

class CreateGroup extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      group: {},
      name: undefined
    }
  }

  addToGroup (contact) {
    var group = this.state.group
    group[contact.id] = contact
    this.setState({group})
  }

  removeFromGroup (contact) {
    var group = this.state.group
    delete group[contact.id]
    this.setState({group})
  }

  handleError (err) {
    this.setState({error: err.message})
  }

  shouldComponentUpdate (nextProps, nextState) {
    // we don't care about the props for now, really.
    return (this.state !== nextState)
  }

  onContactCreateSuccess (contactId) {
    this.addToGroup(this.getContact(contactId))
  }

  createContact () {
    this.props.changeScreen('CreateContact', {
      onContactCreateSuccess: this.onContactCreateSuccess.bind(this)
    })
  }

  getContact (contactOrContactId) {
    const {deltachat} = this.props
    const contactId = contactOrContactId.id || contactOrContactId
    var index = deltachat.contacts.findIndex((c) => {
      return c.id === contactId
    })
    if (index === -1) return this.handleError(`contact with id ${contactId} not found`)
    return deltachat.contacts[index]
  }

  contactInGroup (contact) {
    return this.state.group[contact.id]
  }

  toggleContact (contact) {
    this.contactInGroup(contact) ? this.removeFromGroup(contact) : this.addToGroup(contact)
  }

  createGroup () {
    var contacts = Object.keys(this.state.group).map((id) => this.state.group[id])
    if (!contacts.length) return this.handleError(new Error('Add at least one contact to the group'))
    if (!this.state.name) return this.handleError(new Error('Group name required.'))
    var {chatId, results} = ipcRenderer.sendSync('dispatchSync', 'createUnverifiedGroup', contacts, this.state.name)
    this.props.changeScreen('ChatView', {chatId})
  }

  handleNameChange (e) {
    this.setState({name: e.target.value})
  }

  render () {
    const {deltachat} = this.props
    const {group} = this.state

    return (
      <div>
        {this.state.error && this.state.error}
        <div>
          <Back onClick={this.props.changeScreen} />
          <button onClick={this.createGroup.bind(this)}>Create Group</button>
        </div>
        <div>
          <input type='text' id='name' value={this.state.name} onChange={this.handleNameChange} placeholder='Group Name' />
        </div>
        <div>
          {Object.keys(group).map((id) => {
            var contact = group[id]
            return (<div key={id}>
              {contact.address}
            </div>)
          })}
        </div>
        <div>
          <button
            onClick={this.createContact.bind(this)}>
           Create Contact
          </button>
        </div>
        <div>
          {deltachat.contacts.map((contact) => {
            return (<div key={contact.id} onClick={this.toggleContact.bind(this, contact)}>
              {this.contactInGroup(contact) && 'CHECK'} {contact.nameAndAddr}
            </div>)
          })}
        </div>
      </div>
    )
  }
}
module.exports = CreateGroup
