/* eslint-disable no-useless-escape */
const React = require('react')
const { ipcRenderer } = require('electron')

const ScreenContext = require('./contexts/ScreenContext')
const UnblockContacts = require('./components/UnblockContactsScreen')
const LoginScreen = require('./components/LoginScreen').default
const MainScreen = require('./components/MainScreen')
const dialogs = require('./components/dialogs')

class ScreenController extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      screen: 'MainScreen',
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
    this.attachDialog = this.attachDialog.bind(this)
    this.detachDialog = this.detachDialog.bind(this)
    this.onShowAbout = this.showAbout.bind(this, true)
    this.dialogs = React.createRef()
  }

  changeScreen (screen = 'MainScreen', screenProps = {}) {
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

  attachDialog (...args) {
    this.dialogs.current.attachDialog(...args)
  }

  detachDialog (...args) {
    this.dialogs.current.detachDialog(...args)
  }

  render () {
    const { logins, deltachat } = this.props
    const { screen, screenProps } = this.state

    var Screen
    switch (screen) {
      case 'UnblockContacts':
        Screen = UnblockContacts
        break
      default:
        Screen = MainScreen
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
        <ScreenContext.Provider value={{
          openDialog: this.openDialog,
          closeDialog: this.closeDialog,
          userFeedback: this.userFeedback,
          changeScreen: this.changeScreen,
          attachDialog: this.attachDialog,
          detachDialog: this.detachDialog
        }}>
          {!deltachat.ready
            ? <LoginScreen logins={logins} deltachat={deltachat} />
            : <Screen
              deltachat={deltachat}
              screenProps={screenProps}
              mode={'login'}
            />
          }
          <dialogs.Controller
            ref={this.dialogs}
            deltachat={deltachat}
            userFeedback={this.userFeedback} />
        </ScreenContext.Provider>
      </div>
    )
  }
}

module.exports = ScreenController
