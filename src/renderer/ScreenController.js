const React = require('react')
const { ipcRenderer } = require('electron')

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
    this.onError = this.onError.bind(this)
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
    ipcRenderer.on('error', this.onError)
    ipcRenderer.on('showAboutDialog', this.onShowAbout)
    ipcRenderer.on('DC_EVENT_IMEX_FILE_WRITTEN', (_event, filename) => {
      self.userFeedback({ type: 'success', text: `${filename} created.` })
    })
  }

  componentWillUnmount () {
    ipcRenderer.removeListener('showAboutDialog', this.onShowAbout)
    ipcRenderer.removeListener('showAboutDialog', this.onError)
  }

  onError (event, error) {
    const text = error ? error.toString() : 'Unknown'
    this.userFeedback({ type: 'error', text })
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

    return (
      <div>
        {this.state.message && (
          <div className={classNames}>
            {this.state.message.text}
          </div>
        )}
        {!deltachat.ready
          ? <Login logins={logins} deltachat={deltachat} />
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
        <dialogs.Settings isOpen={showSettings} onClose={this.onCloseSettings} saved={saved} />
        <dialogs.ImexProgress />
      </div>
    )
  }
}

module.exports = Home
