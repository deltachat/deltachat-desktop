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
  constructor (props) {
    super(props)
    this.state = {
      error: null
    }
  }

  handleError (err) {
    this.setState({error: err.message})
  }

  shouldComponentUpdate (nextProps, nextState) {
    // we don't care about the props for now, really.
    return (this.state !== nextState)
  }

  onContactCreateSuccess (contactId) {
    var chatId = ipcRenderer.sendSync('dispatchSync', 'createChatByContactId', contactId)
    this.props.changeScreen('ChatView', {chatId})
  }

  createContact () {
    this.props.changeScreen('CreateContact', {
      onContactCreateSuccess: this.onContactCreateSuccess.bind(this)
    })
  }

  createGroup () {
    this.props.changeScreen('CreateGroup')
  }

  chooseContact (contact) {
    var chatId = ipcRenderer.sendSync('dispatchSync', 'createChatByContactId', contact.id)
    if (!chatId) return this.handleError(new Error(`Invalid contact id ${contact.id}`))
    this.props.changeScreen('ChatView', { chatId })
  }

  render () {
    const { deltachat } = this.props
    const { error } = this.state

    return (
      <div>
        {error && error}
        <Navbar fixedToTop>
          <NavbarGroup align={Alignment.LEFT}>
            <Button className={Classes.MINIMAL} icon='undo' onClick={this.props.changeScreen} />
            <NavbarHeading>Create Chat</NavbarHeading>
          </NavbarGroup>
          <NavbarGroup align={Alignment.RIGHT}>
            <Button
              className={Classes.MINIMAL}
              icon='plus'
              onClick={this.createContact.bind(this)}
              text='Contact' />
            <Button
              className={Classes.MINIMAL}
              icon='plus'
              onClick={this.createGroup.bind(this)}
              text='Group' />
          </NavbarGroup>
        </Navbar>
        <div className='window'>
          {deltachat.contacts.map((contact) => {
            return (<ContactListItem
              contact={contact}
              onClick={this.chooseContact.bind(this)}
            />
            )
          })}
        </div>
      </div>
    )
  }
}

module.exports = CreateChat
