const React = require('react')
const { ipcRenderer } = require('electron')

const confirmation = require('./dialogs/confirmationDialog')
const { RenderContact } = require('./Contact')
const Centered = require('./helpers/Centered')

const {
  Alignment,
  Classes,
  Navbar,
  NavbarGroup,
  NavbarHeading,
  Button
} = require('@blueprintjs/core')

class UnblockContacts extends React.Component {
  constructor (props) {
    super(props)
    this.onContactClick = this.onContactClick.bind(this)
  }

  onContactClick (contact) {
    const tx = window.translate
    confirmation(tx('ask_unblock_contact'), yes => {
      if (yes) {
        ipcRenderer.send('unblockContact', contact.id)
      }
    })
  }

  render () {
    const { deltachat } = this.props
    const tx = window.translate

    const blockedContacts = deltachat.blockedContacts
    return (
      <div>
        <Navbar fixedToTop>
          <NavbarGroup align={Alignment.LEFT}>
            <Button className={Classes.MINIMAL} icon='undo' onClick={this.props.changeScreen} />
            <NavbarHeading>{tx('unblock_contacts_desktop')}</NavbarHeading>
          </NavbarGroup>
        </Navbar>
        <div className='window'>
          {!blockedContacts.length && <Centered><h1>{tx('none_blocked_desktop')}</h1></Centered>}
          {blockedContacts.map((contact) => {
            return (<RenderContact
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
