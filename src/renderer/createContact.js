const React = require('react')
const {ipcRenderer} = require('electron')

const Back = require('./back')

class CreateContact extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      email: '',
      name: ''
    }

    this.handleChange = this.handleChange.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
    this.back = this.back.bind(this)
  }

  back () {
    this.props.changeScreen('CreateChat')
  }

  shouldComponentUpdate (nextProps, nextState) {
    // we don't care about the props for now, really.
    return (this.state !== nextState)
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
    var self = this
    event.preventDefault()
    const {name, email} = this.state

    function createContact () {
      var id = ipcRenderer.sendSync('dispatchSync', 'createContact', name, email)

      if (id !== 0) {
        console.log(`Contact ${id} created or updated.`)
      } else {
        console.log(`Failed, I guess. returned ${id}`)
      }
      self.props.screenProps.onContactCreateSuccess(id)
    }

    // TODO: better frontend email validation

    if (name.length && email.length) {
      createContact(name, email)
    } else if (email.length) {
      createContact(email.split('@')[0], email)
    } else {
      return this.handleError(new Error('Email required.'))
    }
  }

  render () {
    return (
      <div>
        <div>
          <Back onClick={this.back} />
        </div>
        <div>
          <form onSubmit={this.handleSubmit}>
            {this.state.error && this.state.error}
            <input placeholder='E-Mail Address' id='email' type='text' value={this.state.email} onChange={this.handleChange} />
            <input placeholder='Name' id='name' type='name' value={this.state.name} onChange={this.handleChange} />
            <input type='submit' value='Submit' />
          </form>
        </div>
      </div>
    )
  }
}
module.exports = CreateContact

