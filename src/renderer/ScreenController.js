const React = require('react')
const { ipcRenderer } = require('electron')
const styled = require('styled-components').default
const path = require('path')

const {
  H5,
  Card,
  Intent,
  Alignment,
  Navbar,
  NavbarGroup,
  NavbarHeading,
  Button
} = require('@blueprintjs/core')

const NavbarWrapper = require('./components/NavbarWrapper')
const UnblockContacts = require('./components/UnblockContacts')
const Login = require('./components/Login')
const CreateChat = require('./components/CreateChat')
const CreateGroup = require('./components/CreateGroup')
const EditGroup = require('./components/EditGroup')
const CreateContact = require('./components/CreateContact')
const SplittedChatListAndView = require('./components/SplittedChatListAndView')
const dialogs = require('./components/dialogs')
const ContactList = require('./components/ContactList')
const confirmation = require('./components/dialogs/confirmationDialog')

class ScreenController extends React.Component {
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
    this.handleLogin = this.handleLogin.bind(this)
    this.dialogs = React.createRef()
  }

  changeScreen (screen = 'SplittedChatListAndView', screenProps = {}) {
    this.setState({ screen, screenProps })
  }

  userFeedback (message) {
    if (message !== false && this.state.message === message) return // one at a time, cowgirl
    this.setState({ message })
  }

  userFeedbackClick () {
    this.userFeedback(false)
  }

  componentDidMount () {
    ipcRenderer.on('error', this.onError)
    ipcRenderer.on('success', this.onSuccess)
    ipcRenderer.on('showAboutDialog', this.onShowAbout)
  }

  handleLogin (credentials) {
    this.userFeedback(false)
    ipcRenderer.send('login', credentials)
  }

  componentWillUnmount () {
    ipcRenderer.removeListener('showAboutDialog', this.onShowAbout)
    ipcRenderer.removeListener('error', this.onError)
    ipcRenderer.removeListener('success', this.onSuccess)
  }

  onError (event, error) {
    const tx = window.translate
    const text = error ? error.toString() : tx('unknown')
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
            <H5>{tx('login_title')}</H5>
            <Login onSubmit={this.handleLogin} loading={deltachat.configuring}>
              <br />
              <Button type='submit' text={tx('login_title')} />
              <Button type='cancel' text={tx('cancel')} />
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
  align-items: center;
  display: flex;
  justify-content: center;
  height: calc(100vh);

  .bp3-card {
    width: 400px;
    margin-top: 20px;
  }

  .window { 
    padding-left: calc((100vw - 400px) / 2)
  }

`

const LoginItem = styled.li`
  display: flex;
  justify-content: space-between;
  border-right: 1px solid grey;
  border-left: 1px solid grey;
  border-bottom: 1px solid grey;
  min-width: 300px;
  border-radius: 0;

  :hover {
    button.bp3-intent-danger {
      display: inline-flex;
    }
  }

  button.bp3-intent-danger {
    display: none;
  }

  &:first-child {
    border-top: 1px solid grey;
  }

  button.bp3-large {
    width: 90%;
  }
`

function LoginScreen (props) {
  const tx = window.translate
  const children = props.children

  function onClickLogin (login) {
    ipcRenderer.send('login', { addr: login, mailPw: true })
  }

  function forgetLogin (login) {
    const message = tx('forget_login_confirmation_desktop')
    confirmation(message, (yes) => {
      if (yes) ipcRenderer.send('forgetLogin', login)
    })
  }

  return (
    <LoginWrapper>
      <NavbarWrapper>
        <Navbar fixedToTop>
          <NavbarGroup align={Alignment.LEFT}>
            <NavbarHeading>{tx('welcome_desktop')}</NavbarHeading>
          </NavbarGroup>
        </Navbar>
      </NavbarWrapper>
      <div className='window'>
        { props.logins.length > 0 && <Card>
          <H5>{tx('login_known_accounts_title_desktop')}</H5>
          <ul>
            {props.logins.map((login) => <LoginItem key={login}>
              <Button large minimal onClick={() => onClickLogin(login)}>
                {login}
              </Button>
              <Button intent={Intent.DANGER} minimal icon='cross' onClick={() => forgetLogin(login)} />
            </LoginItem>
            )}
          </ul>
        </Card>
        }
        <Card>
          {children}
        </Card>
      </div>
    </LoginWrapper>
  )
}

module.exports = ScreenController
