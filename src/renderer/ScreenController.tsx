/* eslint-disable no-useless-escape */
const React = require('react')
const { ipcRenderer } = require('electron')

const ScreenContext = require('./contexts/ScreenContext')
const LoginScreen = require('./components/LoginScreen').default
const MainScreen = require('./components/MainScreen').default
const dialogs = require('./components/dialogs')

export interface userFeedback {
  type: 'error'|'success'
  text: string
}

export default class ScreenController extends React.Component {
   
  props: any;
  state: { message: userFeedback|false }

  constructor (props:any) {
    super(props)
    this.state = {
      message: false
    }

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

  userFeedback (message:userFeedback|false) {
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

  onError (event:any, error:Error) {
    const tx = (window as any).translate
    const text = error ? error.toString() : tx('unknown')
    this.userFeedback({ type: 'error', text })
  }

  onSuccess (event:any, text: string) {
    this.userFeedback({ type: 'success', text })
  }

  showAbout () {
    this.openDialog('About')
  }

  openDialog (name: string, props?:any) {
    this.dialogs.current.open(name, props)
  }

  closeDialog (name: string) {
    this.dialogs.current.close(name)
  }

  attachDialog (...args:any[]) {
    this.dialogs.current.attachDialog(...args)
  }

  detachDialog (...args:any[]) {
    this.dialogs.current.detachDialog(...args)
  }

  render () {
    const { logins, deltachat } = this.props

    return (
      <div>
        {this.state.message && (
          <div onClick={this.userFeedbackClick}
            className={`user-feedback ${this.state.message.type}`}>
            <p>{this.state.message.text}</p>
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
            : <MainScreen
              deltachat={deltachat}
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
