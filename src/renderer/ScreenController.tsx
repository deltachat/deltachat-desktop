import { Login, AppState } from '../shared/shared-types'

import React from 'react'
import { Component, createRef } from 'react'
const { ipcRenderer } = window.electron_functions

import { ScreenContext } from './contexts'
import LoginScreen from './components/LoginScreen'
import MainScreen from './components/MainScreen'
import {
  Controller as DialogController,
  DialogId,
} from './components/dialogs/index'
import { processOPENPGP4FPRUrl } from './components/dialogs/ImportQrCode'

import * as logger from '../shared/logger'

const log = logger.getLogger('renderer/ScreenController')

export interface userFeedback {
  type: 'error' | 'success'
  text: string
}

export default class ScreenController extends Component {
  dialogs: React.RefObject<DialogController>
  state: { message: userFeedback | false }
  changeScreen: any
  onShowAbout: any

  constructor(
    public props: { logins: Login[]; deltachat: AppState['deltachat'] }
  ) {
    super(props)
    this.state = {
      message: false,
    }

    this.onError = this.onError.bind(this)
    this.onSuccess = this.onSuccess.bind(this)
    this.userFeedback = this.userFeedback.bind(this)
    this.userFeedbackClick = this.userFeedbackClick.bind(this)
    this.openDialog = this.openDialog.bind(this)
    window.__openDialog = this.openDialog.bind(this)
    window.__userFeedback = this.userFeedback.bind(this)
    this.closeDialog = this.closeDialog.bind(this)
    this.onShowAbout = this.showAbout.bind(this, true)
    this.dialogs = createRef()
  }

  userFeedback(message: userFeedback | false) {
    if (message !== false && this.state.message === message) return // one at a time, cowgirl
    this.setState({ message })
  }

  userFeedbackClick() {
    this.userFeedback(false)
  }

  componentDidMount() {
    ipcRenderer.on('error', this.onError)
    ipcRenderer.on('success', this.onSuccess)
    ipcRenderer.on('showAboutDialog', this.onShowAbout)
    ipcRenderer.on('open-url', this.onOpenUrl)

    ipcRenderer.send('frontendReady')
  }

  componentWillUnmount() {
    ipcRenderer.removeListener('showAboutDialog', this.onShowAbout)
    ipcRenderer.removeListener('error', this.onError)
    ipcRenderer.removeListener('success', this.onSuccess)
    ipcRenderer.removeListener('open-url', this.onOpenUrl)
  }

  onError(_event: any, error: Error) {
    const tx = window.translate
    const text = error ? error.toString() : tx('unknown')
    this.userFeedback({ type: 'error', text })
  }

  onSuccess(_event: any, text: string) {
    this.userFeedback({ type: 'success', text })
  }

  showAbout() {
    this.openDialog('About')
  }

  async onOpenUrl(_event: Event, url: string) {
    processOPENPGP4FPRUrl(url)
  }

  openDialog(fnc: any, props?: any) {
    this.dialogs.current.open(fnc, props)
  }

  closeDialog(name: DialogId) {
    this.dialogs.current.close(name)
  }

  render() {
    const { logins, deltachat } = this.props

    window.__isReady = deltachat.ready
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
          }}
        >
          {!deltachat.ready ? (
            <LoginScreen logins={logins} deltachat={deltachat} />
          ) : (
            <MainScreen />
          )}
          <DialogController
            ref={this.dialogs}
            deltachat={deltachat}
            userFeedback={this.userFeedback}
          />
        </ScreenContext.Provider>
      </div>
    )
  }
}
