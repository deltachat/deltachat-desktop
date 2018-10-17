const React = require('react')
const { ipcRenderer } = require('electron')

const ContactListItem = require('./ContactListItem')

const {
  Alignment,
  Classes,
  InputGroup,
  ControlGroup,
  Navbar,
  NavbarGroup,
  NavbarHeading,
  Button
} = require('@blueprintjs/core')

class CreateGroup extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      group: {},
      name: ''
    }
  }

  addToGroup (contactId) {
    const group = this.state.group
    group[contactId] = true
    this.setState({ group })
  }

  removeFromGroup (contactId) {
    const group = this.state.group
    delete group[contactId]
    this.setState({ group })
  }

  shouldComponentUpdate (nextProps, nextState) {
    // we don't care about the props for now, really.
    return (this.state !== nextState)
  }

  contactInGroup (contactId) {
    return !!this.state.group[contactId]
  }

  toggleContact (contactId) {
    if (this.contactInGroup(contactId)) {
      this.removeFromGroup(contactId)
    } else {
      this.addToGroup(contactId)
    }
  }

  createGroup () {
    const tx = window.translate
    const contactIds = Object.keys(this.state.group)
    ipcRenderer.sendSync('dispatchSync', 'createUnverifiedGroup', this.state.name, contactIds)
    this.props.changeScreen('ChatList')
  }

  handleNameChange (e) {
    this.setState({ name: e.target.value })
  }

  isButtonDisabled () {
    if (!this.state.name.length) return true
    if (!Object.keys(this.state.group).length) return true
    return false
  }

  render () {
    const { deltachat } = this.props
    const tx = window.translate
    const { group } = this.state

    return (
      <div>
        <Navbar fixedToTop>
          <NavbarGroup align={Alignment.LEFT}>
            <Button className={Classes.MINIMAL} icon='undo' onClick={this.props.changeScreen} />
            <NavbarHeading>{tx('createGroup')}</NavbarHeading>
          </NavbarGroup>
        </Navbar>
        <div className='window'>
          <div>
            <ControlGroup fill vertical={false}>
              <InputGroup
                type='text'
                id='name'
                value={this.state.name}
                onChange={this.handleNameChange.bind(this)}
                placeholder={tx('groupName')} />
              <Button
                disabled={this.isButtonDisabled()}
                onClick={this.createGroup.bind(this)}
                text={tx('createGroup')} />
            </ControlGroup>
          </div>
          {deltachat.contacts.map(contact => {
            return (
              <ContactListItem
                color={this.contactInGroup(contact.id) ? 'green' : ''}
                onClick={this.toggleContact.bind(this, contact.id)}
                contact={contact}
              />
            )
          })}
        </div>
      </div>
    )
  }
}
module.exports = CreateGroup
