/* *CONFIG* */
const appConfig = require('application-config')('DeltaChat')
const path = require('path')

const UI_HEADER_HEIGHT = 38
const UI_MESSAGE_HEIGHT = 100

module.exports = {
  CONFIG_PATH: getConfigPath(),

  GITHUB_URL: 'https://github.com/deltachat/deltachat-desktop',
  GITHUB_URL_ISSUES: 'https://github.com/deltachat/deltachat-desktop/issues',

  HOME_PAGE_URL: 'https://delta.chat',

  STATIC_PATH: path.join(__dirname, '..', 'static'),

  WINDOW_MAIN: 'file://' + path.join(__dirname, '..', 'static', 'main.html'),

  WINDOW_INITIAL_BOUNDS: {
    width: 500,
    height: UI_HEADER_HEIGHT + (UI_MESSAGE_HEIGHT * 6) // header + 6 messages
  },

  UI_HEADER_HEIGHT,
  UI_MESSAGE_HEIGHT,
  WINDOW_MIN_WIDTH: 450,
  WINDOW_MIN_HEIGHT: 450
}

function getConfigPath () {
  if (process.env.NODE_ENV === 'test') {
    return path.join(process.platform === 'win32' ? 'C:\\Windows\\Temp' : '/tmp', 'DeltaChatTest')
  } else {
    return path.dirname(appConfig.filePath)
  }
}
