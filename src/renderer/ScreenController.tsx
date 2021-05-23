import { DeltaChatAccount } from '../shared/shared-types'

import React from 'react'
import { Component, createRef } from 'react'
const { ipcRenderer } = window.electron_functions

import { ScreenContext } from './contexts'
import LoginScreen from './components/LoginScreen'
import MainScreen from './components/MainScreen'
import DialogController, {
  OpenDialogFunctionType,
  CloseDialogFunctionType,
} from './components/dialogs/DialogController'
import processOpenQrUrl from './components/helpers/OpenQrUrl'

import { getLogger } from '../shared/logger'
import { ContextMenuLayer, showFnType } from './components/ContextMenu'

const log = getLogger('renderer/ScreenController')

export interface userFeedback {
  type: 'error' | 'success'
  text: string
}

export enum Screens {
  Main = 'main',
  Login = 'login',
}

export default class ScreenController extends Component {
  dialogController: React.RefObject<DialogController>
  contextMenuShowFn: showFnType = null
  state: { message: userFeedback | false; screen: Screens }
  onShowAbout: any

  constructor(
    public props: {
      account: DeltaChatAccount
      loadAccount: (login: DeltaChatAccount) => {}
    }
  ) {
    super(props)
    this.state = {
      message: false,
      screen: Screens.Login,
    }

    this.onError = this.onError.bind(this)
    this.onSuccess = this.onSuccess.bind(this)
    this.userFeedback = this.userFeedback.bind(this)
    this.userFeedbackClick = this.userFeedbackClick.bind(this)
    this.openContextMenu = this.openContextMenu.bind(this)
    this.openDialog = this.openDialog.bind(this)
    this.changeScreen = this.changeScreen.bind(this)
    this.closeDialog = this.closeDialog.bind(this)
    this.onShowAbout = this.showAbout.bind(this, true)
    this.dialogController = createRef()

    window.__openDialog = this.openDialog.bind(this)
    window.__userFeedback = this.userFeedback.bind(this)
    window.__closeDialog = this.closeDialog.bind(this)
    window.__changeScreen = this.changeScreen.bind(this)
    window.__loadAccount = this.loadAccount.bind(this)
    window.__screen = this.state.screen
  }

  loadAccount(account: DeltaChatAccount) {
    this.props.loadAccount(account)
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
    this.setState({ screen })
    window.__screen = screen
    if (Screens.Login) {
      // remove user feedback error message - https://github.com/deltachat/deltachat-desktop/issues/2261
      this.userFeedback(false)
    }
  }

  componentDidMount() {
    ipcRenderer.on('error', this.onError)
    ipcRenderer.on('DC_EVENT_ERROR', this.onError)
    ipcRenderer.on('DC_EVENT_LOGIN_FAILED', this.onError)
    ipcRenderer.on('DC_EVENT_ERROR_NETWORK', this.onError)
    ipcRenderer.on('success', this.onSuccess)
    ipcRenderer.on('showAboutDialog', this.onShowAbout)
    ipcRenderer.on('open-url', this.onOpenUrl)

    ipcRenderer.send('frontendReady')
    window.dispatchEvent(new Event('frontendReady'))
  }

  componentWillUnmount() {
    ipcRenderer.removeListener('showAboutDialog', this.onShowAbout)
    ipcRenderer.removeListener('error', this.onError)
    ipcRenderer.removeListener('DC_EVENT_ERROR', this.onError)
    ipcRenderer.removeListener('DC_EVENT_LOGIN_FAILED', this.onError)
    ipcRenderer.removeListener('DC_EVENT_ERROR_NETWORK', this.onError)
    ipcRenderer.removeListener('success', this.onSuccess)
    ipcRenderer.removeListener('open-url', this.onOpenUrl)
  }

  onError(_event: any, [data1, data2]: [string | number, string]) {
    if (this.state.screen === Screens.Login) return
    if (data1 === 0) data1 = ''
    const text = data1 + data2
    this.userFeedback({ type: 'error', text })
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
    return this.dialogController.current.openDialog(...args)
  }

  closeDialog(...args: Parameters<CloseDialogFunctionType>) {
    this.dialogController.current.closeDialog(...args)
  }

  openContextMenu(...args: Parameters<showFnType>) {
    if (!this.contextMenuShowFn) {
      throw new Error('Context Menu Controller not available')
    }
    this.contextMenuShowFn(...args)
  }

  renderScreen() {
    switch (this.state.screen) {
      case Screens.Main:
        return <MainScreen />
      case Screens.Login:
        return <LoginScreen loadAccount={this.props.loadAccount} />
    }
  }

  render() {
    return (
      <div>
        <ContextMenuLayer
          setShowFunction={showFn => {
            this.contextMenuShowFn = showFn
          }}
        />
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
            openContextMenu: this.openContextMenu,
            closeDialog: this.closeDialog,
            userFeedback: this.userFeedback,
            changeScreen: this.changeScreen,
            screen: this.state.screen,
          }}
        >
          {this.renderScreen()}
          <DialogController
            ref={this.dialogController}
            account={this.props.account}
            userFeedback={this.userFeedback}
          />
        </ScreenContext.Provider>
      </div>
    )
  }
}
