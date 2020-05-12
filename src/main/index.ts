console.time('init')

import { ensureDirSync, watchFile } from 'fs-extra'
import { app as rawApp, session, EventEmitter, dialog } from 'electron'
import rc from './rc'

const app = rawApp as ExtendedAppMainProcess
app.rc = rc

if (rc['multiple-instances'] === false && !app.requestSingleInstanceLock()) {
  /* ignore-console-log */
  console.error('Only one instance allowed. Quitting.')
  app.quit()
  process.exit(0)
}

// Setup folders
import {
  getConfigPath,
  getLogsPath,
  getAccountsPath,
  getCustomThemesPath,
} from './application-constants'
ensureDirSync(getConfigPath())
ensureDirSync(getLogsPath())
ensureDirSync(getAccountsPath())
ensureDirSync(getCustomThemesPath())

// Setup Logger
import { cleanupLogFolder, createLogHandler } from './log-handler'
const logHandler = createLogHandler()
import logger from '../shared/logger'
const log = logger.getLogger('main/index')
logger.setLogHandler(logHandler.log, rc)
process.on('exit', logHandler.end)

// Report uncaught exceptions
process.on('uncaughtException', err => {
  const error = { message: err.message, stack: err.stack }
  if (log) {
    log.error('uncaughtError', error)
  } else {
    /* ignore-console-log */
    console.error('uncaughtException', error)
  }
  dialog.showErrorBox(
    'Error - uncaughtException',
    `See the logfile (${logHandler.logFilePath()}) for details and contact the developers about this issue:\n` +
      JSON.stringify(error)
  )
})

import loadTranslations from './load-translations'
import { getLogins } from './logins'
const ipc = require('./ipc')
import { init as initMenu } from './menu'
import State from './state'
import * as mainWindow from './windows/main'
import * as devTools from './devtools'
import { AppState } from '../shared/shared-types'
import { ExtendedAppMainProcess } from './types'
import { resolveThemeAddress, acceptThemeCLI } from './themes'

app.ipcReady = false
app.isQuitting = false

Promise.all([
  getLogins(),
  new Promise((resolve, reject) => app.on('ready', resolve)),
  State.load(),
])
  .then(onReady)
  .catch(error => {
    log.critical('Fatal Error during init', error)
    dialog.showErrorBox('Fatal Error during init', '' + error)
    process.exit(1)
  })

function onReady([logins, _appReady, loadedState]: [
  {
    path: string
    addr: string
  }[],
  any,
  AppState
]) {
  const state = (app.state = loadedState)
  state.logins = logins

  app.saveState = () => State.save({ saved: state.saved })

  loadTranslations(state.saved.locale || app.getLocale())

  const cwd = getConfigPath()
  log.info(`cwd ${cwd}`)
  ipc.init(cwd, state, logHandler)

  mainWindow.init(app, { hidden: false })
  initMenu(logHandler)

  if (rc.debug) mainWindow.toggleDevTools()

  if (app.rc['translation-watch']) {
    watchFile('_locales/_untranslated_en.json', (curr, prev) => {
      if (curr.mtime !== prev.mtime) {
        log.info('translation-watch: File changed reloading translation data')
        mainWindow.chooseLanguage(app.localeData.locale)
        log.info('translation-watch: reloading translation data - done')
      }
    })
  }
  acceptThemeCLI()

  cleanupLogFolder().catch(err =>
    log.error('Cleanup of old logfiles failed: ', err)
  )
}

;(app as EventEmitter).once('ipcReady', () => {
  console.timeEnd('init')
  if (process.env.NODE_ENV === 'test') {
    mainWindow.window.maximize()
  }
  mainWindow.window.on('close', e => {
    if (!app.isQuitting) {
      e.preventDefault()
      mainWindow.hide()
      quit(e)
    }
  })
})

function quit(e: Electron.Event) {
  if (app.isQuitting) return

  app.isQuitting = true
  e.preventDefault()

  function doQuit() {
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
app.on('window-all-closed', (e: Electron.Event) => quit(e))

app.on('web-contents-created', (e, contents) => {
  contents.on('will-navigate', (e, navigationUrl) => {
    e.preventDefault()
  })
  contents.on('new-window', (e, navigationUrl) => {
    e.preventDefault()
  })
})

let contentSecurity = "default-src ' 'none'"
if (process.env.NODE_ENV === 'test') {
  contentSecurity =
    "default-src 'unsafe-inline' 'self' 'unsafe-eval'; img-src 'self' data:;"
}

app.once('ready', () => {
  devTools.tryInstallReactDevTools()
  session.defaultSession.webRequest.onHeadersReceived((details, fun) => {
    fun({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [contentSecurity],
      },
    })
  })
})
