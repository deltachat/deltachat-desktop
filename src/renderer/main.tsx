const { ipcRenderer, remote } = window.electron_functions

import React from 'react'
import ReactDOM from 'react-dom'
import { ExtendedApp } from '../shared/shared-types'

function main () {
  const logger = require('../shared/logger')
  logger.setLogHandler(
    (...args:any[]) => ipcRenderer.send('handleLogMessage', ...args),
    (remote.app as ExtendedApp).rc
  )
  logger.printProcessLogLevelInfo()

  const App = require('./App').default
  ReactDOM.render(<App />, document.querySelector('#root'))
}

main()
