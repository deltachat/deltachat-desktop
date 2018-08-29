const React = require('react')
const {ipcRenderer} = require('electron')

const Back = require('./back')

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
    this.props.changeScreen('ChatView', {chatId})
  }

  render () {
    const {deltachat} = this.props
    const {error} = this.state

    return (
      <div>
        {error && error}
        <div>
          <Back onClick={this.props.changeScreen} />
          <button
            onClick={this.createContact.bind(this)}>
              Create Contact
          </button>
          <button
            onClick={this.createGroup.bind(this)}>
              Create Group
          </button>
        </div>
        <div>
          {deltachat.contacts.map((contact) => {
            return (<div onClick={this.chooseContact.bind(this, contact)}>
              {contact.nameAndAddr}
            </div>)
          })}
        </div>
      </div>
    )
  }
}
module.exports = CreateChat
