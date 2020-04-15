const { ipcRenderer, remote } = window.electron_functions

import React from 'react'
import ReactDOM from 'react-dom'
import { ExtendedApp } from '../../shared/shared-types'
import { exp } from './experimental'
import * as logger from '../../shared/logger'
import App from './App'

function main() {
  exp.help //make sure experimental.ts is used
  const rc = (remote.app as ExtendedApp).rc
  console.log('rc', rc)
  logger.setLogHandler(
    (...args: any[]) => ipcRenderer.send('handleLogMessage', ...args),
    rc
  )
  logger.printProcessLogLevelInfo()

  ReactDOM.render(<App />, document.querySelector('#root'))
}

main()
