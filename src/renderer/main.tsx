const { ipcRenderer, remote } = window.electron_functions

import React from 'react'
import ReactDOM from 'react-dom'
import { ExtendedApp } from '../shared/shared-types'
import { exp } from './experimental'
import logger from '../shared/logger'
import App from './App'

function main() {
  exp.help //make sure experimental.ts is used
  logger.setLogHandler(
    (...args: any[]) => ipcRenderer.send('handleLogMessage', ...args),
    (remote.app as ExtendedApp).rc
  )
  logger.printProcessLogLevelInfo()

  ReactDOM.render(<App />, document.querySelector('#root'))
}

main()
