const appConfig = require('application-config')('DeltaChat')
const path = require('path')
const electron = require('electron')
const arch = require('arch')

const APP_NAME = 'DeltaChat'
const APP_VERSION = require('../package.json').version

const IS_TEST = isTest()
const PORTABLE_PATH = IS_TEST
  ? path.join(process.platform === 'win32' ? 'C:\\Windows\\Temp' : '/tmp', 'DeltaChatTest')
  : path.join(path.dirname(process.execPath), 'Portable Settings')
const IS_PRODUCTION = isProduction()
const IS_PORTABLE = isPortable()

const UI_HEADER_HEIGHT = 38
const UI_MESSAGE_HEIGHT = 100

module.exports = {
  APP_ICON: path.join(__dirname, '..', 'static', 'DeltaChat'),
  APP_NAME: APP_NAME,
  APP_VERSION: APP_VERSION,
  APP_WINDOW_TITLE: APP_NAME + ' (BETA)',

  CONFIG_PATH: getConfigPath(),

  GITHUB_URL: 'https://github.com/deltachat/deltachat-desktop',
  GITHUB_URL_ISSUES: 'https://github.com/deltachat/deltachat-desktop/issues',
  GITHUB_URL_RAW: 'https://raw.githubusercontent.com/deltachat/deltachat-desktop/master',

  HOME_PAGE_URL: 'https://delta.chat',

  IS_PORTABLE: IS_PORTABLE,
  IS_PRODUCTION: IS_PRODUCTION,
  IS_TEST: IS_TEST,

  OS_SYSARCH: arch() === 'x64' ? 'x64' : 'ia32',

  ROOT_PATH: path.join(__dirname, '..'),
  STATIC_PATH: path.join(__dirname, '..', 'static'),

  WINDOW_ABOUT: 'file://' + path.join(__dirname, '..', 'static', 'about.html'),
  WINDOW_MAIN: 'file://' + path.join(__dirname, '..', 'static', 'main.html'),

  WINDOW_INITIAL_BOUNDS: {
    width: 500,
    height: UI_HEADER_HEIGHT + (UI_MESSAGE_HEIGHT * 6) // header + 6 messages
  },

  UI_HEADER_HEIGHT,
  UI_MESSAGE_HEIGHT,
  WINDOW_MIN_WIDTH: 425
}

function getConfigPath () {
  if (IS_PORTABLE) {
    return PORTABLE_PATH
  } else {
    return path.dirname(appConfig.filePath)
  }
}

function getPath (key) {
  if (!process.versions.electron) {
    // Node.js process
    return ''
  } else if (process.type === 'renderer') {
    // Electron renderer process
    return electron.remote.app.getPath(key)
  } else {
    // Electron main process
    return electron.app.getPath(key)
  }
}

function isTest () {
  return process.env.NODE_ENV === 'test'
}

function isPortable () {
  if (IS_TEST) {
    return true
  }

  if (process.platform !== 'win32' || !IS_PRODUCTION) {
    // Fast path: Non-Windows platforms should not check for path on disk
    return false
  }

  const fs = require('fs')

  try {
    // This line throws if the "Portable Settings" folder does not exist, and does
    // nothing otherwise.
    fs.accessSync(PORTABLE_PATH, fs.constants.R_OK | fs.constants.W_OK)
    return true
  } catch (err) {
    return false
  }
}

function isProduction () {
  if (!process.versions.electron) {
    // Node.js process
    return false
  }
  if (process.platform === 'darwin') {
    return !/\/Electron\.app\//.test(process.execPath)
  }
  if (process.platform === 'win32') {
    return !/\\electron\.exe$/.test(process.execPath)
  }
  if (process.platform === 'linux') {
    return !/\/electron$/.test(process.execPath)
  }
}
