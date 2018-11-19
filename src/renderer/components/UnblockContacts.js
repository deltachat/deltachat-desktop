const React = require('react')
const { ipcRenderer } = require('electron')

const dialogs = require('./dialogs')
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
    var message = tx('dialogs.unblockContact', contact.displayName)
    dialogs.confirmation(message, yes => {
      if (yes) {
        ipcRenderer.sendSync('dispatchSync', 'unblockContact', contact.id)
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
            <NavbarHeading>{tx('unblockContacts')}</NavbarHeading>
          </NavbarGroup>
        </Navbar>
        <div className='window'>
          {!blockedContacts.length && <Centered><h1>{tx('unblockContacts.noneBlocked')}</h1></Centered>}
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
