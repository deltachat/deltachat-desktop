console.time('init')

const electron = require('electron')
const app = electron.app

const rc = app.rc = require('../rc')

const parallel = require('run-parallel')
const mkdirp = require('mkdirp')

const localize = require('../localize')
const { getConfigPath } = require('../application-constants')
const logins = require('./logins')
const ipc = require('./ipc')
const menu = require('./menu')
const State = require('../renderer/lib/state')
const windows = require('./windows')
const logHandler = require('./developerTools/logHandler')
const log = require('../logger').getLogger('main/index')

// Setup Logger
require('../logger').setLogHandler(logHandler.log)
logHandler.setupWriteStream()
process.on('exit', function () {
  logHandler.closeWriteStream()
})

mkdirp.sync(getConfigPath())

const ipcMain = electron.ipcMain

app.ipcReady = false // main window has finished loading and IPC is ready
app.isQuitting = false

parallel({
  logins: (cb) => logins(getConfigPath(), cb),
  appReady: (cb) => app.on('ready', () => cb(null)),
  state: (cb) => State.load(cb)
}, onReady)

function onReady (err, results) {
  if (err) throw err

  const state = results.state
  app.logins = results.logins

  const cwd = getConfigPath()
  log.info('cwd', cwd, 'cwd')
  ipc.init(cwd, state)

  localize.setup(app, state.saved.locale || app.getLocale())
  windows.main.init(state, { hidden: false })
  menu.init()

  if (rc.debug) windows.main.toggleDevTools()

  // Report uncaught exceptions
  process.on('uncaughtException', (err) => {
    console.error(err)
    const error = { message: err.message, stack: err.stack }
    windows.main.send('uncaughtError', 'main', error)
    log.error('uncaughtError', error, 'uncaught_error')
  })
}

app.once('ipcReady', () => {
  console.timeEnd('init')
  const win = windows.main.win
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

app.once('ready', () => {
  electron.session.defaultSession.webRequest.onHeadersReceived((details, fun) => {
    fun({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': ['default-src \'none\'']
      }
    })
  })
})
