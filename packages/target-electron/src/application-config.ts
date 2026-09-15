// @ts-ignore
import applicationConfig from 'application-config'
if (process.env.NODE_ENV !== 'production') {
  try {
    process.loadEnvFile?.() // loads ./, falls back on cwd
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('Failed to load .env file', e)
  }
}

const appConfig = applicationConfig('DeltaChat')

import { join } from 'path'
import { app } from 'electron'

if (process.env.DC_TEST_DIR) {
  appConfig.filePath = join(process.env.DC_TEST_DIR, 'config.json')
} else if (process.env.PORTABLE_EXECUTABLE_DIR) {
  // eslint-disable-next-line no-console
  console.log('Running in Portable Mode', process.env.PORTABLE_EXECUTABLE_DIR)
  const dataDir = join(process.env.PORTABLE_EXECUTABLE_DIR, 'DeltaChatData')
  appConfig.filePath = join(dataDir, 'config.json')
  // Chromium keeps its own state (caches, local storage, crash dumps, ...)
  // in `userData`, which defaults to `%APPDATA%\DeltaChat`.
  // Move it next to the executable so nothing is left on the host machine.
  // `sessionData` follows `userData` as long as it is not set separately.
  app.setPath('userData', join(dataDir, 'electron'))
  app.setPath('logs', join(dataDir, 'electron', 'logs'))
}

export default Object.freeze(appConfig)
