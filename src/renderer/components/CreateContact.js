const React = require('react')
const { ipcRenderer } = require('electron')

const {
  Alignment,
  Classes,
  InputGroup,
  FormGroup,
  Navbar,
  NavbarGroup,
  NavbarHeading,
  Button
} = require('@blueprintjs/core')

const NavbarWrapper = require('./NavbarWrapper')

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

  handleChange (event) {
    var state = {}
    state[event.target.id] = event.target.value
    delete state.error
    this.setState(state)
  }

  handleSubmit (event) {
    var self = this
    const tx = window.translate
    event.preventDefault()
    const { name, email } = this.state

    function createContact () {
      const id = ipcRenderer.sendSync('createContact', name, email)
      self.props.screenProps.onSubmit(id)
    }

    // TODO: better frontend email validation

    if (name.length && email.length) {
      createContact(name, email)
    } else if (email.length) {
      createContact(email.split('@')[0], email)
    } else {
      return this.props.userFeedback({ type: 'error', text: tx('email_validation_failed_desktop') })
    }
  }

  render () {
    const tx = window.translate
    return (
      <div>
        <NavbarWrapper>
          <Navbar fixedToTop>
            <NavbarGroup align={Alignment.LEFT}>
              <Button className={Classes.MINIMAL} icon='undo' onClick={this.back} />
              <NavbarHeading>{tx('add_contact_desktop')}</NavbarHeading>
            </NavbarGroup>
          </Navbar>
        </NavbarWrapper>
        <div className='window'>
          <form onSubmit={this.handleSubmit}>
            <FormGroup label={tx('email_address')} placeholder='E-Mail Address' labelFor='email' labelInfo={`(${tx('login_required_desktop')})`}>
              <InputGroup
                id='email'
                type='text'
                value={this.state.email}
                leftIcon='envelope'
                onChange={this.handleChange}
              />
            </FormGroup>
            <FormGroup label={tx('name_desktop')} placeholder='Name' labelFor='name'>
              <InputGroup
                id='name'
                leftIcon='person'
                type='text'
                value={this.state.name}
                onChange={this.handleChange}
              />
            </FormGroup>
            <Button type='submit' text={tx('add_contact_desktop')} />
          </form>
        </div>
      </div>
    )
  }
}

module.exports = CreateContact
