console.time('init')

const electron = require('electron')
const app = electron.app

const parallel = require('run-parallel')
const mkdirp = require('mkdirp')

const localize = require('../localize')
const config = require('../config')
const logins = require('./logins')
const ipc = require('./ipc')
const log = require('./log')
const menu = require('./menu')
const State = require('../renderer/lib/state')
const windows = require('./windows')

// Ensure CONFIG_PATH exists.
mkdirp.sync(config.CONFIG_PATH)

let argv = sliceArgv(process.argv)

if (config.IS_PRODUCTION) {
  // When Electron is running in production mode (packaged app), then run React
  // in production mode too.
  process.env.NODE_ENV = 'production'
}

// (On Windows and Linux, we get a flag. On MacOS, we get special API.)
const hidden = argv.includes('--hidden') ||
  (process.platform === 'darwin' && app.getLoginItemSettings().wasOpenedAsHidden)

const ipcMain = electron.ipcMain

app.ipcReady = false // main window has finished loading and IPC is ready
app.isQuitting = false

parallel({
  logins: (cb) => logins(config.CONFIG_PATH, cb),
  appReady: (cb) => app.on('ready', () => cb(null)),
  state: (cb) => State.load(cb)
}, onReady)

function onReady (err, results) {
  if (err) throw err

  const state = results.state
  app.logins = results.logins

  localize.setup(app, state.saved.locale || app.getLocale())
  windows.main.init(state, { hidden })
  menu.init()
  if (argv.indexOf('--debug') > -1) windows.main.toggleDevTools()

  // Report uncaught exceptions
  process.on('uncaughtException', (err) => {
    console.error(err)
    const error = { message: err.message, stack: err.stack }
    windows.main.send('uncaughtError', 'main', error)
  })
}

var cwd = process.env.TEST_DIR || config.CONFIG_PATH
log('cwd', cwd)
ipc.init(cwd)

app.once('ipcReady', () => {
  log('Command line args:', argv)
  console.timeEnd('init')

  var win = windows.main.win
  win.on('close', e => {
    if (!app.isQuitting) {
      e.preventDefault()
      windows.main.hide()
      quit(e)
    }
  })
})

function quit (e) {
  if (app.isQuitting) return

  app.isQuitting = true
  e.preventDefault()

  windows.main.send('stateSaveImmediate')
  ipcMain.once('stateSaved', () => app.quit())
  setTimeout(() => {
    console.error('Saving state took too long. Quitting.')
    app.quit()
  }, 4000) // quit after 4 secs, at most
}

app.on('before-quit', e => quit(e))
app.on('window-all-closed', e => quit(e))

app.on('web-contents-created', (e, contents) => {
  contents.on('will-navigate', (e, navigationUrl) => {
    e.preventDefault()
  })
  contents.on('new-window', (e, navigationUrl) => {
    e.preventDefault()
  })
})

// Remove leading args.
// Production: 1 arg, eg: /Applications/DeltaChat.app/Contents/MacOS/DeltaChat
// Development: 2 args, eg: electron .
// Test: 4 args, eg: electron -r .../mocks.js .
function sliceArgv (argv) {
  return argv.slice(config.IS_PRODUCTION ? 1
    : config.IS_TEST ? 4
      : 2)
}

electron.session.defaultSession.webRequest.onHeadersReceived((details, fun) => {
  fun({
    responseHeaders: {
      ...details.responseHeaders,
      'Content-Security-Policy': ['default-src \'none\'']
    }
  })
})
