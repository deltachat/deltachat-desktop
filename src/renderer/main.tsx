import React from 'react'
import ReactDOM from 'react-dom'
import { exp } from './experimental'
import { printProcessLogLevelInfo } from '../shared/logger'

import App from './App'
import { runtime } from './runtime'
import initMessageParser from '@deltachat/message_parser_wasm'
import initQuircs from 'quircs-wasm'
import initSystemIntegration from './system-integration'

async function main() {
  exp.help //make sure experimental.ts is used
  try {
    runtime.initialize()
    printProcessLogLevelInfo()
    await Promise.all([
      initMessageParser('./message_parser_wasm_bg.wasm'),
      initQuircs('./quircs_wasm_bg.wasm'),
    ])

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
