const React = require('react')
const { ipcRenderer } = require('electron')

const {
  Alignment,
  Classes,
  Navbar,
  NavbarGroup,
  NavbarHeading,
  Button
} = require('@blueprintjs/core')

const ContactList = require('./ContactList')
const NavbarWrapper = require('./NavbarWrapper')

class CreateChat extends React.Component {
  constructor (props) {
    super(props)
    this.onCreateGroup = this.onCreateGroup.bind(this)
    this.onCreateVerifiedGroup = this.onCreateVerifiedGroup.bind(this)
    this.onCreateContact = this.onCreateContact.bind(this)
    this.chooseContact = this.chooseContact.bind(this)
  }

  shouldComponentUpdate (nextProps, nextState) {
    // we don't care about the props for now, really.
    return (this.state !== nextState)
  }

  onCreateGroup () {
    this.props.changeScreen('CreateGroup')
  }

  onCreateVerifiedGroup () {
    this.props.changeScreen('CreateGroup', { verified: true })
  }

  onCreateContact () {
    var self = this

    var onSubmit = (contactId) => {
      if (contactId !== 0) {
        self.chooseContact({ id: contactId })
      }
    }

    this.props.changeScreen('CreateContact', { onSubmit })
  }

  chooseContact (contact) {
    const tx = window.translate
    var chatId = ipcRenderer.sendSync('dispatchSync', 'createChatByContactId', contact.id)
    if (!chatId) return this.props.userFeedback({ type: 'error', text: tx('create_chat_error_desktop') })
    this.props.changeScreen('ChatView', { chatId })
  }

  render () {
    const { contacts } = this.props
    const tx = window.translate

    return (
      <div>
        <NavbarWrapper>
          <Navbar fixedToTop>
            <NavbarGroup align={Alignment.LEFT}>
              <Button className={Classes.MINIMAL} icon='undo' onClick={this.props.changeScreen} />
              <NavbarHeading>{tx('menu_new_chat')}</NavbarHeading>
            </NavbarGroup>
          </Navbar>
        </NavbarWrapper>
        <div className='window'>
          <div className='CreateChat'>
            <button onClick={this.onCreateGroup}>{tx('menu_new_group')}</button>
            <button onClick={this.onCreateVerifiedGroup}>{tx('menu_new_verified_group')}</button>
            <button onClick={this.onCreateContact}>{tx('add_contact_desktop')}</button>
            <ContactList
              contacts={contacts}
              onContactClick={this.chooseContact.bind(this)}
            />
          </div>
        </div>
      </div>
    )
  }
}

module.exports = CreateChat
