import React from 'react'
import ReactDOM from 'react-dom'
import { exp } from './experimental'
import { printProcessLogLevelInfo } from '../shared/logger'

import App from './App'
import { runtime } from './runtime'
import init from '@deltachat/message_parser_wasm'

async function main() {
  exp.help //make sure experimental.ts is used
  runtime.initialize()
  printProcessLogLevelInfo()

  init('./message_parser_wasm_bg.wasm')

  ReactDOM.render(<App />, document.querySelector('#root'))
}

main()
