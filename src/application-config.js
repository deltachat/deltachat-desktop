const appConfig = require('application-config')('DeltaChat')
const path = require('path')

if (process.env.TEST_DIR) {
  appConfig.filePath = path.join(process.env.TEST_DIR, 'config.json')
}

module.exports = Object.freeze(appConfig)
