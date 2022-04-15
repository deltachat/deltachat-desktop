console.time('init')

import { mkdirSync, Stats, watchFile } from 'fs'
import { app as rawApp, dialog, protocol } from 'electron'
import rc from './rc'
import { VERSION, GIT_REF, BUILD_TIMESTAMP } from '../shared/build-info'
import type { EventEmitter } from 'events'
import contextMenu from './electron-context-menu'
import { findOutIfWeAreRunningAsAppx } from './isAppx'

protocol.registerSchemesAsPrivileged([
  {
    scheme: 'webxdc',
    privileges: {
      allowServiceWorkers: true,
      standard: true,
      supportFetchAPI: true,
      stream: true, // needed for audio playback
    },
  },
])

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
mkdirSync(getConfigPath(), { recursive: true })
mkdirSync(getLogsPath(), { recursive: true })
mkdirSync(getCustomThemesPath(), { recursive: true })

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

import setLanguage, { getCurrentLocaleDate } from './load-translations'
import * as ipc from './ipc'
import { init as initMenu } from './menu'
import { DesktopSettings } from './desktop_settings'
import * as mainWindow from './windows/main'
import * as devTools from './devtools'
import { ExtendedAppMainProcess } from './types'
import { updateTrayIcon, hideDeltaChat, showDeltaChat } from './tray'
import { acceptThemeCLI } from './themes'
import { webxdcStartUpCleanup } from './deltachat/webxdc'

app.ipcReady = false
app.isQuitting = false

Promise.all([
  new Promise((resolve, _reject) => app.on('ready', resolve)),
  DesktopSettings.load(),
  findOutIfWeAreRunningAsAppx(),
  webxdcStartUpCleanup(),
])
  .then(onReady)
  .catch(error => {
    log.critical('Fatal Error during init', error)
    dialog.showErrorBox('Fatal Error during init', '' + error)
    process.exit(1)
  })

async function onReady([_appReady, _loadedState, _appx, _webxdc_cleanup]: [
  any,
  any,
  any,
  any
]) {
  // can fail due to user error so running it first is better (cli argument)
  acceptThemeCLI()

  setLanguage(DesktopSettings.state.locale || app.getLocale())

  const cwd = getAccountsPath()
  log.info(`cwd ${cwd}`)
  await ipc.init(cwd, logHandler)

  mainWindow.init({ hidden: app.rc['minimized'] })
  initMenu(logHandler)

  if (rc.devmode) {
    devTools.tryInstallReactDevTools()
    mainWindow.toggleDevTools()
  }

  if (app.rc['translation-watch']) {
    watchFile('_locales/_untranslated_en.json', (curr: Stats, prev: Stats) => {
      if (curr.mtime !== prev.mtime) {
        log.info('translation-watch: File changed reloading translation data')
        mainWindow.chooseLanguage(getCurrentLocaleDate().locale)
        log.info('translation-watch: reloading translation data - done')
      }
    })
  }

  cleanupLogFolder().catch(err =>
    log.error('Cleanup of old logfiles failed: ', err)
  )
}

;(app as EventEmitter).once('ipcReady', () => {
  if (!mainWindow.window) {
    throw new Error('window does not exist, this should never happen')
  }
  console.timeEnd('init')
  if (process.env.NODE_ENV === 'test') {
    mainWindow.window.maximize()
  }

  updateTrayIcon()

  mainWindow.window.on('close', e => {
    log.debug("mainWindow.window.on('close')")
    if (!app.isQuitting) {
      e.preventDefault()
      if (app.rc['minimized'] || DesktopSettings.state.minimizeToTray) {
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

  DesktopSettings.saveImmediate().then(doQuit)
  setTimeout(() => {
    log.error('Saving state took too long. Quitting.')
    doQuit()
  }, 4000)
}
app.on('activate', () => {
  if (!mainWindow.window) {
    throw new Error('window does not exist, this should never happen')
  }
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
  contents.setWindowOpenHandler(_details => {
    // prevent new windows from being created when clicking on links
    return { action: 'deny' }
  })

  // Prevent webview tags from being created,
  // if you need them make sure to read https://www.electronjs.org/docs/latest/tutorial/security#12-verify-webview-options-before-creation
  // to not indroduce security risks
  contents.on('will-attach-webview', (event, _webPreferences, _params) => {
    event.preventDefault()
  })
})

contextMenu()

import { openUrlFromArgv } from './open_url'
openUrlFromArgv(process.argv)
