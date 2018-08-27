const React = require('react')
const {ipcRenderer} = require('electron')

const CreateChat = require('./createChat')
const CreateContact = require('./createContact')

class Chats extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      deadDropContact: false
    }
    this.onDeadDropClose = this.onDeadDropClose.bind(this)
  }

  onCreateContact () {
    this.props.changeScreen(CreateContact)
  }

  onDeadDropClose () {
    this.setState({deadDropContact: false})
  }

  onCreateChat () {
    this.props.changeScreen(CreateChat)
  }

  onDeadDropClick (deadDropContact) {
    this.setState({deadDropContact})
  }

  render () {
    const {deltachat} = this.props
    const {deadDropContact} = this.state

    return (
      <div>
        <DeadDropDialog deadDropContact={deadDropContact} onDeadDropClose={this.onDeadDropClose} />
        <div className='header'>
          <div>
            {deltachat.credentials.email}
          </div>
          <button onClick={this.onCreateChat.bind(this)}>
            + Chat
          </button>
        </div>

        <div className='list-messages'>
          {deltachat.chats.map((chat) => {
            if (!chat) return
            if (chat.id === 1) {
              var contact = chat.messages[0].contact
              return (<div>
                <button onClick={this.onDeadDropClick.bind(this, contact)}>
                  New message from {contact.address}
                </button>
              </div>)
            }
            return (
              <div>
                {chat.summary.timestamp}

                {chat.name}
                <div id='summary'>{chat.summary.text2}</div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }
}

class DeadDropDialog extends React.Component {
  constructor (props) {
    super(props)
    this.yes = this.yes.bind(this)
    this.no = this.no.bind(this)
    this.never = this.never.bind(this)
  }

  yes () {
    ipcRenderer.send('dispatch', 'chatWithContact', this.props.deadDropContact.id)
    this.props.deadDropClose()
  }

  no () {
    this.props.deadDropClose()
  }

  never () {
    ipcRenderer.send('dispatch', 'blockContact', this.props.deadDropContact.id)
    this.props.deadDropClose()
  }

  render () {
    const {deadDropContact} = this.props
    if (!deadDropContact) return <div />
    return (
      <div>
        <h3>Chat with {deadDropContact.address}?</h3>

        <div>
          <button onClick={this.yes}> Yes </button>
          <button onClick={this.no}> No </button>
          <button onClick={this.never}> Never </button>
        </div>
      </div>
    )
  }
}

module.exports = Chats
