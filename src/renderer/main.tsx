import { ipcBackend } from './ipc'

import React from 'react'
import ReactDOM from 'react-dom'

function main () {
  const logger = require('../shared/logger')
  logger.setLogHandler((...args:any[]) => ipcBackend.send('handleLogMessage', ...args))
  logger.printProcessLogLevelInfo()

  const App = require('./App').default
  ReactDOM.render(<App />, document.querySelector('#root'))
}

main()
