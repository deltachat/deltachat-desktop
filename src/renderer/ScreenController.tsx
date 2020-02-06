import { Login, AppState } from "../shared/shared-types"

import React from "react"
import { Component, createRef } from 'react'
import { ipcRenderer } from 'electron'

import { ScreenContext } from './contexts'
import LoginScreen from'./components/LoginScreen'
import MainScreen from './components/MainScreen'
import {Controller as DialogController} from './components/dialogs/index'


export interface userFeedback {
  type: 'error'|'success'
  text: string
}

export default class ScreenController extends Component {

  dialogs: React.RefObject<DialogController>;
  state: { message: userFeedback|false };
  changeScreen:any;
  onShowAbout:any;

  constructor (public props:{logins:Login[], deltachat: AppState['deltachat']}) {
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
    this.onShowAbout = this.showAbout.bind(this, true)
    this.dialogs = createRef()
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

  onError (_event:any, error:Error) {
    const tx = (window as any).translate
    const text = error ? error.toString() : tx('unknown')
    this.userFeedback({ type: 'error', text })
  }

  onSuccess (_event:any, text: string) {
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
        }}>
          {!deltachat.ready
            ? <LoginScreen logins={logins} deltachat={deltachat} />
            : <MainScreen/>
          }
          <DialogController
            ref={this.dialogs}
            deltachat={deltachat}
            userFeedback={this.userFeedback} />
        </ScreenContext.Provider>
      </div>
    )
  }
}
