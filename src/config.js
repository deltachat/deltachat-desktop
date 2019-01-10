/* *CONFIG* */
const appConfig = require('application-config')('DeltaChat')
const path = require('path')

module.exports = {
  CONFIG_PATH: getConfigPath()
}

function getConfigPath () {
  if (process.env.NODE_ENV === 'test') {
    return path.join(process.platform === 'win32' ? 'C:\\Windows\\Temp' : '/tmp', 'DeltaChatTest')
  } else {
    return path.dirname(appConfig.filePath)
  }
}
