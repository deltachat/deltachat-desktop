import { AppState, DeltaChatAccount } from '../shared/shared-types'

import React from 'react'
import { Component, createRef } from 'react'
const { ipcRenderer } = window.electron_functions

import { ScreenContext } from './contexts'
import LoginScreen from './components/LoginScreen'
import MainScreen from './components/MainScreen'
import DialogController, {
  DialogId,
  OpenDialogFunctionType,
  CloseDialogFunctionType,
} from './components/dialogs/DialogController'
import processOpenQrUrl from './components/helpers/OpenQrUrl'

import { getLogger } from '../shared/logger'

const log = getLogger('renderer/ScreenController')

export interface userFeedback {
  type: 'error' | 'success'
  text: string
}

export enum Screens {
  Main = 'main',
  Login = 'login'
}

export default class ScreenController extends Component {
  dialogController: React.RefObject<DialogController>
  state: { message: userFeedback | false, screen: Screens }
  onShowAbout: any

  constructor(
    public props: {
      deltachat: AppState['deltachat']
    }
  ) {
    super(props)
    this.state = {
      message: false,
      screen: Screens.Login
    }

    this.onError = this.onError.bind(this)
    this.onSuccess = this.onSuccess.bind(this)
    this.userFeedback = this.userFeedback.bind(this)
    this.userFeedbackClick = this.userFeedbackClick.bind(this)
    this.openDialog = this.openDialog.bind(this)
    this.changeScreen = this.changeScreen.bind(this)
    this.closeDialog = this.closeDialog.bind(this)
    this.onShowAbout = this.showAbout.bind(this, true)
    this.dialogController = createRef()

    window.__openDialog = this.openDialog.bind(this)
    window.__userFeedback = this.userFeedback.bind(this)
    window.__closeDialog = this.closeDialog.bind(this)
    window.__changeScreen = this.changeScreen.bind(this)
    window.__screen = this.state.screen

  }

  userFeedback(message: userFeedback | false) {
    if (message !== false && this.state.message === message) return // one at a time, cowgirl
    this.setState({ message })
  }

  userFeedbackClick() {
    this.userFeedback(false)
  }

  changeScreen(screen: Screens) {
    log.debug('Changing screen to:', screen)
    this.setState({screen})
    window.__screen = this.state.screen
  }

  componentDidMount() {
    ipcRenderer.on('error', this.onError)
    ipcRenderer.on('DC_EVENT_ERROR', this.onError)
    ipcRenderer.on('success', this.onSuccess)
    ipcRenderer.on('showAboutDialog', this.onShowAbout)
    ipcRenderer.on('open-url', this.onOpenUrl)

    ipcRenderer.send('frontendReady')
  }

  componentWillUnmount() {
    ipcRenderer.removeListener('showAboutDialog', this.onShowAbout)
    ipcRenderer.removeListener('error', this.onError)
    ipcRenderer.removeListener('DC_EVENT_ERROR', this.onError)
    ipcRenderer.removeListener('success', this.onSuccess)
    ipcRenderer.removeListener('open-url', this.onOpenUrl)
  }

  onError(_event: any, data1: string, data2: string) {
    this.userFeedback({ type: 'error', text: data2 })
  }

  onSuccess(_event: any, text: string) {
    this.userFeedback({ type: 'success', text })
  }

  showAbout() {
    this.openDialog('About')
  }

  async onOpenUrl(_event: Event, url: string) {
    processOpenQrUrl(url)
  }

  openDialog(...args: Parameters<OpenDialogFunctionType>) {
    this.dialogController.current.openDialog(...args)
  }

  closeDialog(...args: Parameters<CloseDialogFunctionType>) {
    this.dialogController.current.closeDialog(...args)
  }

  renderScreen() {
    switch (this.state.screen) {
      case Screens.Main:
        return <MainScreen />
      case Screens.Login:
        return <LoginScreen deltachat={this.props.deltachat} />
    }
  }

  render() {
    const { deltachat } = this.props

    return (
      <div>
        {this.state.message && (
          <div
            onClick={this.userFeedbackClick}
            className={`user-feedback ${this.state.message.type}`}
          >
            <p>{this.state.message.text}</p>
          </div>
        )}
        <ScreenContext.Provider
          value={{
            openDialog: this.openDialog,
            closeDialog: this.closeDialog,
            userFeedback: this.userFeedback,
            changeScreen: this.changeScreen,
            screen: this.state.screen
          }}
        >
          { this.renderScreen() }
          <DialogController
            ref={this.dialogController}
            deltachat={deltachat}
            userFeedback={this.userFeedback}
          />
        </ScreenContext.Provider>
      </div>
    )
  }
}
