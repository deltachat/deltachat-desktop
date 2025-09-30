import React from 'react'
import { createRoot } from 'react-dom/client'

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
  // eslint-disable-next-line @typescript-eslint/no-unused-expressions
  exp.help //make sure experimental.ts is used
  try {
    await runtime.initialize(setLogHandler, getLogger)
    printProcessLogLevelInfo()

    initSystemIntegration()
    const domNode = document.querySelector('#root')
    if (!domNode) {
      throw new Error('No element with ID root in the DOM. Cannot continue')
    }
    const root = createRoot(domNode)
    root.render(<App />)
  } catch (error) {
    document.write(
      'Error while initialisation, please contact developers and look into the dev console for details:' +
        error
    )
    throw error
  }
}

main()
