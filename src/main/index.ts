console.time('init')

import { mkdirSync, Stats, watchFile } from 'fs'
import { app as rawApp, dialog, ipcMain, protocol } from 'electron'
import rc from './rc'
import { VERSION, GIT_REF, BUILD_TIMESTAMP } from '../shared/build-info'
import type { EventEmitter } from 'events'
import contextMenu from './electron-context-menu'
import { findOutIfWeAreRunningAsAppx } from './isAppx'
import { getHelpMenu } from './help_menu'

// Hardening: prohibit all DNS queries, except for Mapbox
// (see src/renderer/components/map/MapComponent.tsx)
// The `~NOTFOUND` string is here:
// https://chromium.googlesource.com/chromium/src/+/6459548ee396bbe1104978b01e19fcb1bb68d0e5/net/dns/mapped_host_resolver.cc#46
// Chromium docs that touch on `--host-resolver-rules` and DNS:
// https://www.chromium.org/developers/design-documents/network-stack/socks-proxy/
// https://www.chromium.org/developers/design-documents/dns-prefetching/
const hostRules = 'MAP * ~NOTFOUND, EXCLUDE *.mapbox.com'
rawApp.commandLine.appendSwitch('host-resolver-rules', hostRules)
rawApp.commandLine.appendSwitch('host-rules', hostRules)

if (rc['version'] === true || rc['v'] === true) {
  /* ignore-console-log */
  console.info(VERSION)
  process.exit()
}

if (rc['help'] === true || rc['h'] === true) {
  getHelpMenu()
  process.exit()
}

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
import { ExtendedAppMainProcess } from './types'
import { updateTrayIcon, hideDeltaChat, showDeltaChat } from './tray'
import './notifications'
import { acceptThemeCLI } from './themes'
import { webxdcStartUpCleanup } from './deltachat/webxdc'
import { cleanupDraftTempDir } from './cleanup_temp_dir'

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

let ipc_shutdown_function: (() => void) | null = null

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
  ipc_shutdown_function = await ipc.init(cwd, logHandler)

  mainWindow.init({ hidden: app.rc['minimized'] })
  initMenu(logHandler)

  if (rc.devmode) {
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
  cleanupDraftTempDir()
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

  log.info('Starting app shutdown process')
  // close window
  try {
    mainWindow.window?.close()
    mainWindow.window?.destroy()
  } catch (error) {
    log.error('failed to close window, error:', error)
  }

  // does stop io and other things
  ipc_shutdown_function && ipc_shutdown_function()

  cleanupDraftTempDir()

  function doQuit() {
    log.info('Quitting now. Bye.')
    app.quit()
  }
  DesktopSettings.saveImmediate().then(() => {
    // timeout here to ensure core messages that come after quit are still logged
    // (there should not be core activity after quit, but sometimes there are)
    setTimeout(doQuit, 500)
  })
  setTimeout(() => {
    log.error('Saving state took too long. Quitting.')
    doQuit()
  }, 4000)
}
app.on('activate', () => {
  log.debug("app.on('activate')")
  if (!mainWindow.window) {
    log.warn('window not set, this is normal on startup')
    return
  }
  if (mainWindow.window.isVisible() === false) {
    log.debug("app.on('activate') showing main window")
    showDeltaChat()
  } else {
    log.debug("app.on('activate') mainWindow is visible, no need to show it")
  }
})
app.on('before-quit', e => quit(e))
app.on('window-all-closed', (e: Electron.Event) => quit(e))

app.on('web-contents-created', (_ev, contents) => {
  const is_webxdc = contents.session.storagePath?.indexOf('webxdc_') !== -1
  if (is_webxdc) {
    contents.on('will-navigate', (e, navigationUrl) => {
      if (navigationUrl.startsWith('webxdc://')) {
        // allow internal webxdc nav
        return
      } else if (navigationUrl.startsWith('mailto:')) {
        // handle mailto in dc
        e.preventDefault()
        open_url(navigationUrl)
        mainWindow.window?.focus()
      } else {
        // prevent navigation to unknown scheme
        e.preventDefault()
      }
    })
  } else {
    contents.on('will-navigate', (e, navigationUrl) => {
      log.warn('blocked naviagation attempt to', navigationUrl)
      e.preventDefault()
    })
  }
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

import { openUrlFromArgv, open_url } from './open_url'
openUrlFromArgv(process.argv)

ipcMain.handle('restart_app', async _ev => {
  app.relaunch()
  app.quit()
})
