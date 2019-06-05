const React = require('react')
const { ipcRenderer } = require('electron')
const styled = require('styled-components').default

const confirmation = require('./dialogs/confirmationDialog')
const { RenderContact } = require('./Contact')
const blockedContactsStore = require('../stores/blockedContacts')

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

  onContactsUpdate (blockedContacts) {
    this.setState({ blockedContacts: blockedContacts })
  }

  componentDidMount () {
    this.setState({ selectedChat: blockedContactsStore.getState() })
    blockedContactsStore.subscribe(this.onContactsUpdate)
    ipcRenderer.send('EVENT_DC_FUNCTION_CALL', 'updateBlockedContacts')
  }

  componentWillUnmount () {
    blockedContactsStore.unsubscribe(this.onContactsUpdate)
  }

  onContactClick (contact) {
    const tx = window.translate
    confirmation(tx('ask_unblock_contact'), yes => {
      if (yes) {
        ipcRenderer.send('EVENT_DC_FUNCTION_CALL', 'unblockContact', contact.id)
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
            <Button className={Classes.MINIMAL} icon='undo' onClick={this.props.changeScreen} />
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

module.exports = UnblockContacts
