const appConfig = require('application-config')('DeltaChat')
const path = require('path')

const portable = false

if (process.env.TEST_DIR) {
  appConfig.filePath = path.join(process.env.TEST_DIR, 'config.json')
} else if (portable) {
  /* ignore-console-log */
  console.log('Running in Portable Mode', process.cwd())
  appConfig.filePath = path.join(process.cwd(), 'DeltaChatData', 'config.json')
}

module.exports = Object.freeze(appConfig)
