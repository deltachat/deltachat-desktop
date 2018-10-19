const React = require('react')
const { ipcRenderer } = require('electron')

const ContactListItem = require('./ContactListItem')

const {
  Alignment,
  Classes,
  Navbar,
  NavbarGroup,
  NavbarHeading,
  Button
} = require('@blueprintjs/core')

class CreateChat extends React.Component {
  shouldComponentUpdate (nextProps, nextState) {
    // we don't care about the props for now, really.
    return (this.state !== nextState)
  }

  chooseContact (contact) {
    const tx = window.translate
    var chatId = ipcRenderer.sendSync('dispatchSync', 'createChatByContactId', contact.id)
    if (!chatId) return this.props.userFeedback({ type: 'error', text: tx('createChatError') })
    this.props.changeScreen('ChatView', { chatId })
  }

  render () {
    const { deltachat } = this.props
    const tx = window.translate

    return (
      <div>
        <Navbar fixedToTop>
          <NavbarGroup align={Alignment.LEFT}>
            <Button className={Classes.MINIMAL} icon='undo' onClick={this.props.changeScreen} />
            <NavbarHeading>{tx('addChat')}</NavbarHeading>
          </NavbarGroup>
        </Navbar>
        <div className='window'>
          <div className='CreateChat'>
            {deltachat.contacts.map((contact) => {
              return (<ContactListItem
                contact={contact}
                onClick={this.chooseContact.bind(this)}
              />
              )
            })}
          </div>
        </div>
      </div>
    )
  }
}

module.exports = CreateChat
