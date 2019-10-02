const React = require('react')
const { callDcMethod } = require('../ipc')
const styled = require('styled-components').default
const ScreenContext = require('../contexts/ScreenContext')

const confirmation = require('./dialogs/ConfirmationDialog').confirmationDialogLegacy
const { RenderContact } = require('./contact/Contact')
const contactsStore = require('../stores/contacts')

const {
  Alignment,
  Classes,
  Navbar,
  NavbarGroup,
  NavbarHeading,
  Button
} = require('@blueprintjs/core')

const NoneBlocked = styled.h1`
  text-align: center;
`

class UnblockContacts extends React.Component {
  constructor (props) {
    super(props)
    this.onContactClick = this.onContactClick.bind(this)
    this.onContactsUpdate = this.onContactsUpdate.bind(this)
    this.state = {
      blockedContacts: []
    }
  }

  onContactsUpdate (contactState) {
    const { blockedContacts } = contactState
    this.setState({ blockedContacts })
  }

  componentDidMount () {
    const { blockedContacts } = contactsStore.getState()
    this.setState({ blockedContacts })
    contactsStore.subscribe(this.onContactsUpdate)
    callDcMethod('updateBlockedContacts')
  }

  componentWillUnmount () {
    contactsStore.unsubscribe(this.onContactsUpdate)
  }

  onContactClick (contact) {
    const tx = window.translate
    confirmation(tx('ask_unblock_contact'), yes => {
      if (yes) {
        callDcMethod('unblockContact', [contact.id])
      }
    })
  }

  render () {
    const tx = window.translate

    const blockedContacts = this.state.blockedContacts
    return (
      <div>
        <Navbar fixedToTop>
          <NavbarGroup align={Alignment.LEFT}>
            <Button className={Classes.MINIMAL} icon='undo'
              onClick={this.context.changeScreen}
              aria-label={tx('back')} />
            <NavbarHeading>{tx('unblock_contacts_desktop')}</NavbarHeading>
          </NavbarGroup>
        </Navbar>
        <div className='window'>
          {!blockedContacts.length && <NoneBlocked>{tx('none_blocked_desktop')}</NoneBlocked>}
          {blockedContacts.map((contact) => {
            return (<RenderContact
              key={contact.id}
              contact={contact}
              onClick={this.onContactClick.bind(this, contact)}
            />
            )
          })}
        </div>
      </div>
    )
  }
}
UnblockContacts.contextType = ScreenContext

module.exports = UnblockContacts
