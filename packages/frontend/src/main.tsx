import React from 'react'
import ReactDOM from 'react-dom'
import initWasm from '@deltachat/message_parser_wasm'

import App from './App'
import initSystemIntegration from './system-integration'
import { exp } from './experimental'
import {
  getLogger,
  printProcessLogLevelInfo,
  setLogHandler,
} from '../../shared/logger'
import { runtime } from '@deltachat-desktop/runtime-interface'

async function main() {
  exp.help //make sure experimental.ts is used
  try {
    await runtime.initialize(setLogHandler, getLogger)
    printProcessLogLevelInfo()

    await initWasm('./message_parser_wasm_bg.wasm')

    initSystemIntegration()

    ReactDOM.render(<App />, document.querySelector('#root'))
  } catch (error) {
    document.write(
      'Error while initialisation, please contact developers and look into the dev console for details:' +
        error
    )
    throw error
  }
}

main()
