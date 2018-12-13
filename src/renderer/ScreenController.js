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
      showAbout: false,
      showSettings: false,
      message: false
    }

    this.changeScreen = this.changeScreen.bind(this)
    this.userFeedback = this.userFeedback.bind(this)
    this.onShowAbout = this.showAbout.bind(this, true)
    this.onShowSettings = this.showSettings.bind(this, true)
    this.onCloseSettings = this.showSettings.bind(this, false)
    this.onCloseAbout = this.showAbout.bind(this, false)
  }

  changeScreen (screen = 'SplittedChatListAndView', screenProps = {}) {
    this.setState({ screen, screenProps })
  }

  userFeedback (message) {
    var self = this
    setTimeout(function () {
      self.setState({ message: false })
    }, 3000)
    self.setState({ message })
  }

  componentDidMount () {
    var self = this
    ipcRenderer.on('error', function (e, text) {
      self.userFeedback({ type: 'error', text })
    })
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
  }

  showAbout (showAbout) {
    this.setState({ showAbout })
  }

  showSettings (showSettings) {
    this.setState({ showSettings })
  }

  render () {
    const { saved, logins, deltachat } = this.props
    const { screen, screenProps, showAbout, showSettings } = this.state

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
          <div className={classNames}>
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
            openSettings={this.onShowSettings}
            userFeedback={this.userFeedback}
            changeScreen={this.changeScreen}
            deltachat={deltachat}
          />
        }
        <dialogs.About isOpen={showAbout} onClose={this.onCloseAbout} />
        <dialogs.Settings
          userFeedback={this.userFeedback}
          deltachat={deltachat}
          isOpen={showSettings}
          onClose={this.onCloseSettings}
          saved={saved} />
        <dialogs.ImexProgress />
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
        <Callout intent='danger' title='Single folder incompatibility'>
          To improve the user experience with Delta Chat using multiple devices, we experimentally changed the behaviour of Delta Chat. Therefore, beginning with this release, we aren't compatible with the <b>old android client</b> which you can currently find in the f-droid store. Please use the <b>new development</b> version. You can find it <ClickableLink href='https://github.com/deltachat/deltachat-android-ii/releases'>here</ClickableLink>.
        </Callout>
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
