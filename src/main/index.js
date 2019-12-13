console.time('init')

const fs = require('fs')
const { app, session } = require('electron')
const rc = app.rc = require('../rc')

if (!app.requestSingleInstanceLock()) {
  /* ignore-console-log */
  console.error('Only one instance allowed. Quitting.')
  app.quit()
}

// Setup folders
const mkdirp = require('mkdirp')
const { getConfigPath, getLogsPath } = require('../application-constants')
mkdirp.sync(getConfigPath())
mkdirp.sync(getLogsPath())

// Setup Logger
const logHandler = require('./log-handler')()
const logger = require('../logger')
const log = logger.getLogger('main/index')
logger.setLogHandler(logHandler.log)
process.on('exit', logHandler.end)

// Report uncaught exceptions
process.on('uncaughtException', (err) => {
  const error = { message: err.message, stack: err.stack }
  log.error('uncaughtError', error)
  throw err
})

const parallel = require('run-parallel')

const localize = require('../localize')
const { getLogins } = require('./logins')
const ipc = require('./ipc')
const menu = require('./menu')
const State = require('./state')
const windows = require('./windows')
const devTools = require('./devtools')

app.ipcReady = false
app.isQuitting = false

parallel({
  logins: (cb) => getLogins().then(res => cb(null, res)).catch(err => cb(err)),
  appReady: (cb) => app.on('ready', () => cb(null)),
  state: (cb) => State.load(cb)
}, onReady)

function updateTheme () {
  const sendTheme = () => {
    const content = fs.readFileSync(app.rc['theme'])
    windows.main.send('theme-update', JSON.parse(content))
  }
  if (!app.ipcReady) {
    log.info('theme: Waiting for ipc to be ready before setting theme.')
    app.once('ipcReady', sendTheme)
    return
  }
  sendTheme()
}

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
  menu.init(logHandler)

  if (rc.debug) windows.main.toggleDevTools()

  if (app.rc['translation-watch']) {
    fs.watchFile('_locales/_untranslated_en.json', (curr, prev) => {
      if (curr.mtime !== prev.mtime) {
        log.info('translation-watch: File changed reloading translation data')
        windows.main.chooseLanguage(app.localeData.locale)
        log.info('translation-watch: reloading translation data - done')
      }
    })
  }

  if (app.rc['theme']) {
    log.info(`theme: trying to load theme from '${app.rc['theme']}'`)
    if (fs.existsSync(app.rc['theme'])) {
      updateTheme()
      log.info(`theme: set theme`)
      if (app.rc['theme-watch']) {
        log.info('theme-watch: activated', app.rc['theme-watch'])
        fs.watchFile(app.rc['theme'], (curr, prev) => {
          if (curr.mtime !== prev.mtime) {
            log.info('theme-watch: File changed reloading theme data')
            updateTheme()
            log.info('theme-watch: reloading theme data - done')
          }
        })
      }
    } else {
      log.error("theme: couldn't find file")
    }
  }
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
    log.info('Quitting now. Bye.')
    app.quit()
  }

  State.saveImmediate(app.state, doQuit)

  setTimeout(() => {
    log.error('Saving state took too long. Quitting.')
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
  devTools.tryInstallReactDevTools()
  session.defaultSession.webRequest.onHeadersReceived((details, fun) => {
    fun({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': ['default-src \'none\'']
      }
    })
  })
})
