console.time('init')

import { ensureDirSync, watchFile } from 'fs-extra'
import { app as rawApp, dialog } from 'electron'
import rc from './rc'
import { VERSION, GIT_REF, BUILD_TIMESTAMP } from '../shared/build-info'
import type { EventEmitter } from 'events'

const app = rawApp as ExtendedAppMainProcess
app.rc = rc

if (
  process.platform !== 'darwin' &&
  rc['multiple-instances'] === false &&
  !app.requestSingleInstanceLock()
) {
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
import { getLogger, setLogHandler } from '../shared/logger'
const log = getLogger('main/index')
setLogHandler(logHandler.log, rc)
log.info(`Deltachat Version ${VERSION} ${GIT_REF} ${BUILD_TIMESTAMP}`)
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

import setLanguage from './load-translations'
import { getLogins } from './logins'
import * as ipc from './ipc'
import { init as initMenu } from './menu'
import State from './state'
import * as mainWindow from './windows/main'
import * as devTools from './devtools'
import { AppState, DeltaChatAccount } from '../shared/shared-types'
import { ExtendedAppMainProcess } from './types'
import { updateTrayIcon, hideDeltaChat, showDeltaChat } from './tray'
import { acceptThemeCLI } from './themes'

app.ipcReady = false
app.isQuitting = false

Promise.all([
  getLogins(),
  new Promise((resolve, _reject) => app.on('ready', resolve)),
  State.load(),
])
  .then(onReady)
  .catch(error => {
    log.critical('Fatal Error during init', error)
    dialog.showErrorBox('Fatal Error during init', '' + error)
    process.exit(1)
  })

function onReady([logins, _appReady, loadedState]: [
  DeltaChatAccount[],
  any,
  AppState
]) {
  const state = (app.state = loadedState)
  state.logins = logins

  app.saveState = () => State.save({ saved: state.saved })

  // can fail due to user error so running it first is better (cli argument)
  acceptThemeCLI()

  setLanguage(state.saved.locale || app.getLocale())

  const cwd = getConfigPath()
  log.info(`cwd ${cwd}`)
  ipc.init(cwd, logHandler)

  mainWindow.init(app, { hidden: app.rc['minimized'] })
  initMenu(logHandler)

  if (rc.debug) {
    devTools.tryInstallReactDevTools()
    mainWindow.toggleDevTools()
  }

  if (app.rc['translation-watch']) {
    watchFile('_locales/_untranslated_en.json', (curr, prev) => {
      if (curr.mtime !== prev.mtime) {
        log.info('translation-watch: File changed reloading translation data')
        mainWindow.chooseLanguage(app.localeData.locale)
        log.info('translation-watch: reloading translation data - done')
      }
    })
  }

  cleanupLogFolder().catch(err =>
    log.error('Cleanup of old logfiles failed: ', err)
  )
}

;(app as EventEmitter).once('ipcReady', () => {
  console.timeEnd('init')
  if (process.env.NODE_ENV === 'test') {
    mainWindow.window.maximize()
  }

  updateTrayIcon()

  mainWindow.window.on('close', e => {
    log.debug("mainWindow.window.on('close')")
    if (!app.isQuitting) {
      e.preventDefault()
      if (app.rc['minimized'] || app.state.saved.minimizeToTray) {
        log.debug("mainWindow.window.on('close') Hiding main window")
        hideDeltaChat()
      } else {
        if (process.platform === 'darwin') {
          log.debug(
            "mainWindow.window.on('close') We are on mac, so lets hide the main window"
          )
          hideDeltaChat()
        } else {
          log.debug("mainWindow.window.on('close') Quitting deltachat")
          quit(e)
        }
      }
    }
  })
})

export function quit(e?: Electron.Event) {
  if (app.isQuitting) return

  app.isQuitting = true
  e?.preventDefault()

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
app.on('activate', () => {
  log.debug("app.on('activate')")
  if (mainWindow.window.isVisible() === false) {
    log.debug("app.on('activate') showing main window")
    showDeltaChat()
  } else {
    log.debug("app.on('activate') mainWindow is visible, no need to show it")
  }
})
app.on('before-quit', e => quit(e))
app.on('window-all-closed', (e: Electron.Event) => quit(e))

app.on('web-contents-created', (_e, contents) => {
  contents.on('will-navigate', (e, _navigationUrl) => {
    e.preventDefault()
  })
  contents.on('new-window', (e, _navigationUrl) => {
    e.preventDefault()
  })
})

import contextMenu from './electron-context-menu'

contextMenu()
