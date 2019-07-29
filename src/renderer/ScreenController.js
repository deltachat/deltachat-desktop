/* eslint-disable no-useless-escape */
const React = require('react')
const { ipcRenderer } = require('electron')

const ScreenContext = require('./contexts/ScreenContext')
const UnblockContacts = require('./components/UnblockContacts')
const LoginScreen = require('./components/LoginScreen').default
const CreateChat = require('./components/CreateChat')
const CreateGroup = require('./components/CreateGroup')
const EditGroup = require('./components/EditGroup')
const CreateContact = require('./components/CreateContact')
const SplittedChatListAndView = require('./components/SplittedChatListAndView')
const dialogs = require('./components/dialogs')

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
          <div onClick={this.userFeedbackClick}
            className={classNames}>
            {this.state.message.text}
          </div>
        )}
        {!deltachat.ready
          ? <LoginScreen logins={logins} deltachat={deltachat} />
          : <ScreenContext.Provider value={{
            openDialog: this.openDialog,
            closeDialog: this.closeDialog,
            userFeedback: this.userFeedback,
            changeScreen: this.changeScreen
          }}>
            <Screen
              saved={saved}
              deltachat={deltachat}
              screenProps={screenProps}
            />
          </ScreenContext.Provider>
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

module.exports = ScreenController
