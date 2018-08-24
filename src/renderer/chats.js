const React = require('react')
const CreateChat = require('./createChat')
const CreateContact = require('./createContact')

class Chats extends React.Component {
  onCreateContact () {
    console.log(this.props)
    this.props.changeScreen(CreateContact)
  }

  onCreateChat () {
    this.props.changeScreen(CreateChat)
  }

  render () {
    const deltachat = this.props.deltachat
    return (
      <div>
        <div className='header'>
          <div>
            {deltachat.credentials.email}
          </div>
          <button onClick={this.onCreateContact.bind(this)}>
            + Contact
          </button>
          <button onClick={this.onCreateChat.bind(this)}>
            + Chat
          </button>
        </div>

        <div className='list-messages'>
          {deltachat.chats.map((chat) => {
            if (!chat.msg) return <div>{chat.messageId}</div>
            return (
              <div>
                {chat.contact.getName()}: {chat.msg}
              </div>
            )
          })}
        </div>
      </div>
    )
  }
}
module.exports = Chats
