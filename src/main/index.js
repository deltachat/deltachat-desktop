console.time('init')

// Setup folders
const mkdirp = require('mkdirp')
const { getConfigPath, getLogsPath } = require('../application-constants')
mkdirp.sync(getConfigPath())
mkdirp.sync(getLogsPath())

const { app, session } = require('electron')
const rc = app.rc = require('../rc')

// Setup Logger
const logHandler = require('./log-handler')()
const logger = require('../logger')
const log = logger.getLogger('main/index')
logger.setLogHandler(logHandler.log)
process.on('exit', logHandler.end)

const parallel = require('run-parallel')

const localize = require('../localize')
const logins = require('./logins')
const ipc = require('./ipc')
const menu = require('./menu')
const State = require('./state')
const windows = require('./windows')

// Report uncaught exceptions
process.on('uncaughtException', (err) => {
  const error = { message: err.message, stack: err.stack }
  log.error('uncaughtError', error)
  throw err
})

app.ipcReady = false
app.isQuitting = false

parallel({
  logins: (cb) => logins(getConfigPath(), cb),
  appReady: (cb) => app.on('ready', () => cb(null)),
  state: (cb) => State.load(cb)
}, onReady)

function onReady (err, results) {
  if (err) throw err

  const state = app.state = results.state
  state.logins = results.logins

  app.saveState = () => State.save({ saved: state.saved })

  localize.setup(app, state.saved.locale || app.getLocale())

  const cwd = getConfigPath()
  log.info(`cwd ${cwd}`)
  ipc.init(cwd, state, logHandler)

  windows.main.init(app, { hidden: false })
  menu.init()

  if (rc.debug) windows.main.toggleDevTools()
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

  function doQuit () {
    console.log('Quitting now. Bye.')
    app.quit()
  }

  State.saveImmediate(app.state, doQuit)

  setTimeout(() => {
    console.error('Saving state took too long. Quitting.')
    doQuit()
  }, 4000)
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
  session.defaultSession.webRequest.onHeadersReceived((details, fun) => {
    fun({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': ['default-src \'none\'']
      }
    })
  })
})
