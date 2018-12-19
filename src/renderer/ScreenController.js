const React = require('react')
const { ipcRenderer } = require('electron')
const styled = require('styled-components').default

const {
  Alignment,
  Navbar,
  NavbarGroup,
  NavbarHeading,
  Callout,
  Button
} = require('@blueprintjs/core')

const NavbarWrapper = require('./components/NavbarWrapper')
const ClickableLink = require('./components/helpers/ClickableLink')
const UnblockContacts = require('./components/UnblockContacts')
const Login = require('./components/Login')
const CreateChat = require('./components/CreateChat')
const CreateGroup = require('./components/CreateGroup')
const EditGroup = require('./components/EditGroup')
const CreateContact = require('./components/CreateContact')
const SplittedChatListAndView = require('./components/SplittedChatListAndView')
const dialogs = require('./components/dialogs')
const ContactList = require('./components/ContactList')

class Home extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      screen: 'SplittedChatListAndView',
      screenProps: {},
      message: false
    }

    this.changeScreen = this.changeScreen.bind(this)
    this.onError = this.onError.bind(this)
    this.onSuccess = this.onSuccess.bind(this)
    this.userFeedback = this.userFeedback.bind(this)
    this.userFeedbackClick = this.userFeedbackClick.bind(this)
    this.openDialog = this.openDialog.bind(this)
    this.closeDialog = this.closeDialog.bind(this)
    this.onShowAbout = this.showAbout.bind(this, true)
    this.dialogs = React.createRef()
  }

  changeScreen (screen = 'SplittedChatListAndView', screenProps = {}) {
    this.setState({ screen, screenProps })
  }

  userFeedback (message) {
    if (message !== false && this.state.message) return // one at a time, cowgirl
    this.setState({ message })
  }

  userFeedbackClick () {
    this.userFeedback(false)
  }

  componentDidMount () {
    var self = this
    ipcRenderer.on('error', this.onError)
    ipcRenderer.on('success', this.onSuccess)
    ipcRenderer.on('showAboutDialog', this.onShowAbout)
    ipcRenderer.on('DC_EVENT_IMEX_FILE_WRITTEN', (_event, filename) => {
      self.userFeedback({ type: 'success', text: `${filename} created.` })
    })
  }

  handleLogin (credentials) {
    ipcRenderer.send('login', credentials)
  }

  componentWillUnmount () {
    ipcRenderer.removeListener('showAboutDialog', this.onShowAbout)
    ipcRenderer.removeListener('error', this.onError)
    ipcRenderer.removeListener('success', this.onSuccess)
  }

  onError (event, error) {
    const text = error ? error.toString() : 'Unknown'
    this.userFeedback({ type: 'error', text })
  }

  onSuccess (event, text) {
    this.userFeedback({ type: 'success', text })
  }

  showAbout (showAbout) {
    this.openDialog('About')
  }

  openDialog (name, props) {
    this.dialogs.current.open(name, props)
  }

  closeDialog (name) {
    this.dialogs.current.close(name)
  }

  render () {
    const { saved, logins, deltachat } = this.props
    const { screen, screenProps } = this.state

    var Screen
    switch (screen) {
      case 'CreateChat':
        Screen = CreateChat
        break
      case 'CreateContact':
        Screen = CreateContact
        break
      case 'CreateGroup':
        Screen = CreateGroup
        break
      case 'EditGroup':
        Screen = EditGroup
        break
      case 'ContactList':
        Screen = ContactList
        break
      case 'UnblockContacts':
        Screen = UnblockContacts
        break
      default:
        Screen = SplittedChatListAndView
        break
    }

    var type = this.state.message.type
    var classNames = `user-feedback ${type}`
    const tx = window.translate

    return (
      <div>
        {this.state.message && (
          <div onClick={this.userFeedbackClick}
            className={classNames}>
            {this.state.message.text}
          </div>
        )}
        {!deltachat.ready
          ? <LoginScreen logins={logins}>
            <Login onSubmit={this.handleLogin}
              loading={deltachat.configuring}>
              <Button type='submit' text={tx('login.button')} />
              <Button type='cancel' text={tx('login.cancel')} />
            </Login>
          </LoginScreen>
          : <Screen
            saved={saved}
            screenProps={screenProps}
            openDialog={this.openDialog}
            closeDialog={this.closeDialog}
            userFeedback={this.userFeedback}
            changeScreen={this.changeScreen}
            deltachat={deltachat}
          />
        }
        <dialogs.Controller
          ref={this.dialogs}
          deltachat={deltachat}
          saved={saved}
          userFeedback={this.userFeedback} />
      </div>
    )
  }
}

const LoginWrapper = styled.div`
  .window {
    height: auto;
  }
`

function LoginScreen (props) {
  const tx = window.translate
  const children = props.children

  function onClickLogin (login) {
    ipcRenderer.send('login', { addr: login, mailPw: true })
  }

  return (
    <LoginWrapper>
      <NavbarWrapper>
        <Navbar fixedToTop>
          <NavbarGroup align={Alignment.LEFT}>
            <NavbarHeading>{tx('login.welcome')}</NavbarHeading>
          </NavbarGroup>
        </Navbar>
      </NavbarWrapper>
      <div className='window'>
        <ul>
          {props.logins.map((login) => <li key={login}>
            <Button onClick={() => onClickLogin(login)}> {login}</Button>
          </li>
          )}
        </ul>
        {children}
      </div>
    </LoginWrapper>
  )
}

module.exports = Home
