const { ipcRenderer, remote } = window.electron_functions

import React from 'react'
import ReactDOM from 'react-dom'
import { ExtendedApp } from '../shared/shared-types'
import { exp } from './experimental'
import { setLogHandler, printProcessLogLevelInfo } from '../shared/logger'

import App from './App'

function main() {
  exp.help //make sure experimental.ts is used
  setLogHandler(
    (...args: any[]) => ipcRenderer.send('handleLogMessage', ...args),
    (remote.app as ExtendedApp).rc
  )
  printProcessLogLevelInfo()

  ReactDOM.render(<App />, document.querySelector('#root'))
}

main()
