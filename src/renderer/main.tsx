import React from 'react'
import ReactDOM from 'react-dom'
import { exp } from './experimental'
import { printProcessLogLevelInfo } from '../shared/logger'

import App from './App'
import { runtime } from './runtime'

function main() {
  exp.help //make sure experimental.ts is used
  runtime.initialize()
  printProcessLogLevelInfo()

  ReactDOM.render(<App />, document.querySelector('#root'))
}

main()
