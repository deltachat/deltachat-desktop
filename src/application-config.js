const appConfig = require('application-config')('DeltaChat')
const path = require('path')

if (process.env.TEST_DIR) {
  appConfig.filePath = path.join(process.env.TEST_DIR, 'config.json')
} else if (process.env.PORTABLE_EXECUTABLE_DIR) {
  /* ignore-console-log */
  console.log('Running in Portable Mode', process.env.PORTABLE_EXECUTABLE_DIR)
  appConfig.filePath = path.join(process.env.PORTABLE_EXECUTABLE_DIR, 'DeltaChatData', 'config.json')
}

module.exports = Object.freeze(appConfig)
