import { ipcRenderer } from 'electron'

import React from 'react'
import ReactDOM from 'react-dom'

function main () {
  const logger = require('../logger')
  logger.setLogHandler((...args) => ipcRenderer.send('handleLogMessage', ...args))
  logger.printProcessLogLevelInfo()

  const App = require('./App').default
  ReactDOM.render(<App />, document.querySelector('#root'))
}

main()
