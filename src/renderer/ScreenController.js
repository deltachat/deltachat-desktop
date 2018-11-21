const React = require('react')
const { ipcRenderer } = require('electron')

const UnblockContacts = require('./components/UnblockContacts')
const Login = require('./components/Login')
const CreateChat = require('./components/CreateChat')
const CreateGroup = require('./components/CreateGroup')
const EditGroup = require('./components/EditGroup')
const CreateContact = require('./components/CreateContact')
const SplittedChatListAndView = require('./components/SplittedChatListAndView')
const AboutDialog = require('./components/dialogs/About')

class Home extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      screen: 'SplittedChatListAndView',
      screenProps: {},
      showAbout: false,
      message: false
    }

    this.changeScreen = this.changeScreen.bind(this)
    this.userFeedback = this.userFeedback.bind(this)
    this.onShowAbout = this.showAbout.bind(this, true)
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
  }

  componentWillUnmount () {
    ipcRenderer.removeListener('showAboutDialog', this.onShowAbout)
  }

  showAbout (showAbout) {
    this.setState({ showAbout })
  }

  render () {
    const { logins, deltachat } = this.props
    const { screen, screenProps, showAbout } = this.state

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
            screenProps={screenProps}
            userFeedback={this.userFeedback}
            changeScreen={this.changeScreen}
            deltachat={deltachat}
          />
        }
        <AboutDialog isOpen={showAbout} onClose={this.onCloseAbout} />
      </div>
    )
  }
}

module.exports = Home
