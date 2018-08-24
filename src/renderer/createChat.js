const React = require('react')
const {ipcRenderer} = require('electron')

class CreateChat extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      contactId: null
    }
    this.handleChange = this.handleChange.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
  }

  handleError (err) {
    this.setState({error: err.message})
  }

  handleChange (event) {
    var state = {}
    state[event.target.id] = event.target.value
    delete state.error
    this.setState(state)
  }

  handleSubmit (event) {
    event.preventDefault()

    const {contactId} = this.state
    var contact = ipcRenderer.sendSync('dispatchSync', 'getContact', contactId)
    if (!contact) return this.handleError(new Error(`Invalid contact id ${contactId}`))
    var chatId = ipcRenderer.sendSync('createChatByContactId', contactId)
    console.log('created chat', chatId)
    ipcRenderer.send('render')
  }

  shouldComponentUpdate (nextProps, nextState) {
    // we don't care about the props for now, really.
    return (this.state !== nextState)
  }

  render () {
    return (
      <div>
        <form onSubmit={this.handleSubmit}>
          {this.state.error && <div>this.state.error</div>}
          <input id='contactId' type='contactId' value={this.state.contactId} onChange={this.handleChange} />
          <input type='submit' value='Submit' />
        </form>
      </div>
    )
  }
}
module.exports = CreateChat
