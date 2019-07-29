const React = require('react')
const { ipcRenderer } = require('electron')
const contactsStore = require('../stores/contacts')
const ScreenContext = require('../contexts/ScreenContext')

const {
  Alignment,
  Classes,
  Navbar,
  NavbarGroup,
  NavbarHeading,
  Button
} = require('@blueprintjs/core')

const styled = require('styled-components').default

const ContactList = require('./ContactList')
const NavbarWrapper = require('./NavbarWrapper')

const OvalDeltaButton = styled.button`
  background-color: ${props => props.theme.ovalButtonBg};
  padding: 10px;
  border-style: none;
  border-radius: 180px;
  margin: 10px;
  font-weight: bold;
  color: ${props => props.theme.ovalButtonText};
  &:focus {
    outline: none;
  }
  &:hover {
    background-color: ${props => props.theme.ovalButtonBgHover};
    color: ${props => props.theme.ovalButtonTextHover};
  }
`

class CreateChat extends React.Component {
  constructor (props) {
    super(props)
    this.onCreateGroup = this.onCreateGroup.bind(this)
    this.onCreateVerifiedGroup = this.onCreateVerifiedGroup.bind(this)
    this.onCreateContact = this.onCreateContact.bind(this)
    this.chooseContact = this.chooseContact.bind(this)
    this.assignContacts = this.assignContacts.bind(this)
    this.state = {
      contacts: []
    }
  }

  shouldComponentUpdate (nextProps, nextState) {
    // we don't care about the props for now, really.
    return (this.state !== nextState)
  }

  assignContacts (contactsState) {
    const { contacts } = contactsState
    this.setState({ contacts })
  }

  componentDidMount () {
    contactsStore.subscribe(this.assignContacts)
    ipcRenderer.send(
      'EVENT_DC_FUNCTION_CALL',
      'getContacts',
      0,
      ''
    )
  }

  componentWillUnmount () {
    contactsStore.unsubscribe(this.assignContacts)
  }

  onCreateGroup () {
    this.context.changeScreen('CreateGroup')
  }

  onCreateVerifiedGroup () {
    this.context.changeScreen('CreateGroup', { verified: true })
  }

  onCreateContact () {
    var self = this

    var onSubmit = (contactId) => {
      if (contactId !== 0) {
        self.chooseContact({ id: contactId })
      }
    }

    this.context.changeScreen('CreateContact', { onSubmit })
  }

  chooseContact (contact) {
    const tx = window.translate
    const chatId = ipcRenderer.sendSync('createChatByContactId', contact.id)
    if (!chatId) return this.context.userFeedback({ type: 'error', text: tx('create_chat_error_desktop') })
    this.context.changeScreen('ChatView', { chatId })
  }

  render () {
    const { contacts } = this.state
    const tx = window.translate

    return (
      <div>
        <NavbarWrapper>
          <Navbar fixedToTop>
            <NavbarGroup align={Alignment.LEFT}>
              <Button className={Classes.MINIMAL} icon='undo' onClick={this.context.changeScreen} />
              <NavbarHeading>{tx('menu_new_chat')}</NavbarHeading>
            </NavbarGroup>
          </Navbar>
        </NavbarWrapper>
        <div className='window'>
          <div className='CreateChat'>
            <OvalDeltaButton onClick={this.onCreateGroup}>{tx('menu_new_group')}</OvalDeltaButton>
            <OvalDeltaButton onClick={this.onCreateContact}>{tx('add_contact_desktop')}</OvalDeltaButton>
            <OvalDeltaButton style={{ marginLeft: '30px' }} onClick={this.onCreateVerifiedGroup}>{tx('menu_new_verified_group')}</OvalDeltaButton>
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

CreateChat.contextType = ScreenContext

module.exports = CreateChat
