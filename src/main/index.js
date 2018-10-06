console.time('init')

const electron = require('electron')
const app = electron.app

const parallel = require('run-parallel')

const localize = require('../localize')
const config = require('../config')
const logins = require('./logins')
const ipc = require('./ipc')
const log = require('./log')
const menu = require('./menu')
const State = require('../renderer/lib/state')
const windows = require('./windows')

let shouldQuit = false
let argv = sliceArgv(process.argv)

if (config.IS_PRODUCTION) {
  // When Electron is running in production mode (packaged app), then run React
  // in production mode too.
  process.env.NODE_ENV = 'production'
}

// (On Windows and Linux, we get a flag. On MacOS, we get special API.)
const hidden = argv.includes('--hidden') ||
  (process.platform === 'darwin' && app.getLoginItemSettings().wasOpenedAsHidden)

if (!shouldQuit && !config.IS_PORTABLE) {
  // Prevent multiple instances of app from running at same time. New instances
  // signal this instance and quit. Note: This feature creates a lock file in
  // %APPDATA%\Roaming\DeltaChat so we do not do it for the Portable App since
  // we want to be "silent" as well as "portable".
  shouldQuit = app.makeSingleInstance(onAppOpen)
  if (shouldQuit) {
    app.quit()
  }
}

if (!shouldQuit) {
  init()
}

function init () {
  if (config.IS_PORTABLE) {
    const path = require('path')
    // Put all user data into the "Portable Settings" folder
    app.setPath('userData', config.CONFIG_PATH)
    // Put Electron crash files, etc. into the "Portable Settings\Temp" folder
    app.setPath('temp', path.join(config.CONFIG_PATH, 'Temp'))
  }

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
      windows.main.dispatch('uncaughtError', 'main', error)
    })
  }

  ipc.init()

  app.once('ipcReady', function () {
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
    windows.main.dispatch('stateSaveImmediate') // try to save state on exit
    ipcMain.once('stateSaved', () => app.quit())
    setTimeout(() => {
      console.error('Saving state took too long. Quitting.')
      app.quit()
    }, 4000) // quit after 4 secs, at most
  }

  app.on('before-quit', function (e) {
    quit(e)
  })

  app.on('window-all-closed', function (e) {
    quit(e)
  })
}

function onAppOpen (newArgv) {
  newArgv = sliceArgv(newArgv)

  if (app.ipcReady) {
    log('Second app instance opened, but was prevented:', newArgv)
    windows.main.show()
  } else {
    argv.push(...newArgv)
  }
}

// Remove leading args.
// Production: 1 arg, eg: /Applications/DeltaChat.app/Contents/MacOS/DeltaChat
// Development: 2 args, eg: electron .
// Test: 4 args, eg: electron -r .../mocks.js .
function sliceArgv (argv) {
  return argv.slice(config.IS_PRODUCTION ? 1
    : config.IS_TEST ? 4
      : 2)
}
