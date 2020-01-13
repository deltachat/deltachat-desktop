import { ipcRenderer } from 'electron'

import React from 'react'
import ReactDOM from 'react-dom'

// eslint-disable-next-line
window.eval = global.eval = function () {
  throw new Error(`Sorry, this app does not support window.eval().`)
}

function main () {
  const logger = require('../shared/logger')
  logger.setLogHandler((...args:any[]) => ipcRenderer.send('handleLogMessage', ...args))
  logger.printProcessLogLevelInfo()

  const App = require('./App').default
  ReactDOM.render(<App />, document.querySelector('#root'))
}

main()
