import debounce from 'debounce'
import electron, { BrowserWindow, Rectangle, session } from 'electron'
import { isAbsolute, join, sep } from 'path'
import { platform } from 'os'
import { fileURLToPath } from 'url'
import { Session } from 'electron/main'

import { appWindowTitle } from '../../../shared/constants.js'
import { getLogger } from '../../../shared/logger.js'
import {
  appIcon,
  windowDefaults,
  htmlDistDir,
  ALLOWED_STATIC_FOLDERS,
  getAccountsPath,
  ALLOWED_ACCOUNT_FOLDERS,
} from '../application-constants.js'
import { refreshTrayContextMenu } from '../tray.js'
import { DesktopSettings } from '../desktop_settings.js'
import { refresh as refreshTitleMenu } from '../menu.js'
import { initMinWinDimensionHandling } from './helpers.js'
import { setContentProtection } from '../content-protection.js'

const log = getLogger('/mainWindow')

type ExtendedBrowserWindow = BrowserWindow & {
  hidden?: boolean
  /**
   * whitelist of file paths that user selected that the UI should be able to also load via the file:/// scheme
   * example: when changing avatar, we need to display the selected image before it is uploaded to core
   */
  filePathWhiteList: string[]
}

export let window: ExtendedBrowserWindow | null = null

export function init(options: { hidden: boolean }) {
  if (window) {
    return window.show()
  }

  const defaults = windowDefaults()
  const initialBounds = Object.assign(
    defaults.bounds,
    DesktopSettings.state.bounds
  )

  const isMac = platform() === 'darwin'

  const mainWindow = (window = <ExtendedBrowserWindow>(
    new electron.BrowserWindow({
      backgroundColor: '#282828',
      // backgroundThrottling: false, // do not throttle animations/timers when page is background
      darkTheme: true, // Forces dark theme (GTK+3)
      icon: appIcon(),
      show: false,
      title: appWindowTitle,
      height: initialBounds.height,
      width: initialBounds.width,
      x: initialBounds.x,
      y: initialBounds.y,
      webPreferences: {
        nodeIntegration: false,
        preload: defaults.preload,
        spellcheck: false, // until we can load a local dictionary, see https://github.com/electron/electron/issues/22995
        webSecurity: true,
        allowRunningInsecureContent: false,
        contextIsolation: false,
      },
      titleBarStyle: isMac ? 'hidden' : 'default',
      titleBarOverlay: true,
    })
  ))
  mainWindow.filePathWhiteList = []

  initMinWinDimensionHandling(mainWindow, defaults.minWidth, defaults.minHeight)

  setContentProtection(window)

  // disable network request to fetch dictionary
  // issue: https://github.com/electron/electron/issues/22995
  // feature request for local dictionary: https://github.com/electron/electron/issues/22995
  session.defaultSession.setSpellCheckerDictionaryDownloadURL('https://00.00/')

  window.loadFile(join(htmlDistDir(), defaults.main))

  window.once('ready-to-show', () => {
    if (!options.hidden) mainWindow.show()
    if (process.env.NODE_ENV === 'test') {
      mainWindow.maximize()
    }
  })

  if (window.setSheetOffset) {
    window.setSheetOffset(defaults.headerHeight)
  }

  window.webContents.on('will-navigate', (e: electron.Event, _url: string) => {
    // Prevent drag-and-drop from navigating the Electron window, which can happen
    // before our drag-and-drop handlers have been initialized.
    e.preventDefault()
  })

  const saveBounds = debounce(() => {
    const bounds = window?.getBounds()
    if (bounds) {
      DesktopSettings.update({ bounds })
    }
  }, 1000)

  window.on('move', saveBounds)

  window.on('resize', saveBounds)

  window.once('show', () => {
    if (DesktopSettings.state.zoomFactor !== undefined) {
      // apply existing legacy zoomFactor once
      mainWindow.webContents.setZoomFactor(DesktopSettings.state.zoomFactor)
      // we don't save or read zoomFactor from settings any more
      DesktopSettings.update({ zoomFactor: undefined })
    }
  })
  window.on('close', () => {})
  window.on('blur', () => {
    mainWindow.hidden = true
    refreshTrayContextMenu()
  })
  window.on('focus', () => {
    mainWindow.hidden = false
    refreshTrayContextMenu()
    refreshTitleMenu()
  })

  const allowed_web_permissions = [
    'notifications',
    'pointerLock',
    'fullscreen',
    'clipboard-read',
    'media',
    'mediaKeySystem',
    'accessibility-events',
    'clipboard-sanitized-write',
    // not used:
    //  "display-capture", - not used
    //  "geolocation", - not used
    //  "midi" - not used
    //  "midiSysex" - not used
    // what is this about?
    //  "openExternal"
    //  "window-placement"
  ]
  type permission_arg = Parameters<
    Exclude<Parameters<Session['setPermissionRequestHandler']>[0], null>
  >[1]
  const permission_handler = (permission: permission_arg) => {
    log.info('preq', permission)
    if (!allowed_web_permissions.includes(permission)) {
      log.info(
        `main window requested "${permission}" permission, but we denied it, because it is not in the list of allowed permissions.`
      )
      return false
    } else {
      return true
    }
  }
  window.webContents.session.setPermissionCheckHandler((_wc, permission) => {
    return permission_handler(permission as any)
  })
  window.webContents.session.setPermissionRequestHandler(
    (_wc, permission, callback) => {
      callback(permission_handler(permission))
    }
  )

  window.webContents.session.webRequest.onBeforeRequest(
    { urls: ['file://*'] },
    (details, callback) => {
      const pathname = fileURLToPath(
        decodeURIComponent(new URL(details.url).href)
      )

      if (!isAbsolute(pathname) || pathname.includes('..')) {
        log.errorWithoutStackTrace('tried to access relative path', pathname)
        return callback({ cancel: true })
      }
      if (pathname.startsWith(getAccountsPath())) {
        const relativePathInAccounts = pathname.replace(getAccountsPath(), '')
        const relativePathInAccount = relativePathInAccounts.slice(
          relativePathInAccounts.indexOf(sep, 1) + 1
        )
        if (
          ALLOWED_ACCOUNT_FOLDERS.find(allowedPath =>
            relativePathInAccount.startsWith(allowedPath)
          )
        ) {
          return callback({ cancel: false })
        }
      }

      if (
        ALLOWED_STATIC_FOLDERS.find(allowedPath =>
          pathname.startsWith(allowedPath)
        )
      ) {
        return callback({ cancel: false })
      }

      if (window?.filePathWhiteList.includes(pathname)) {
        return callback({ cancel: false })
      }

      log.errorWithoutStackTrace(
        'tried to access path that is not whitelisted',
        {
          pathname,
          ALLOWED_ACCOUNT_FOLDERS,
          accountPaths: getAccountsPath(),
          filePathWhiteList: window?.filePathWhiteList,
        }
      )
      return callback({ cancel: true })
    }
  )
}

export function hide() {
  window?.hide()
}

export function send(channel: string, ...args: any[]) {
  if (!window) {
    log.warn("window not defined, can't send ipc to renderer")
    return
  }
  if (window.isDestroyed()) {
    log.info('window is destroyed. not sending message', args)
    return
  }
  try {
    window.webContents.send(channel, ...args)
  } catch (error) {
    log.error('can not send message to window, error:', error)
  }
}

/**
 * Enforce window aspect ratio. Remove with 0. (Mac)
 */
// export function setAspectRatio(aspectRatio) {
//   window?.setAspectRatio(aspectRatio)
// }

export function setBounds(
  bounds: Rectangle & { contentBounds: boolean },
  maximize: boolean
) {
  if (!window) {
    throw new Error('window does not exist, this should never happen')
  }
  // Maximize or minimize, if the second argument is present
  if (maximize === true && !window.isMaximized()) {
    log.debug('setBounds: maximizing')
    window.maximize()
  } else if (maximize === false && window.isMaximized()) {
    log.debug('setBounds: unmaximizing')
    window.unmaximize()
  }

  const willBeMaximized =
    typeof maximize === 'boolean' ? maximize : window.isMaximized()
  // Assuming we're not maximized or maximizing, set the window size
  if (!willBeMaximized) {
    log.debug(`setBounds: setting bounds to ${JSON.stringify(bounds)}`)
    if (bounds.x === null && bounds.y === null) {
      // X and Y not specified? By default, center on current screen
      const scr = electron.screen.getDisplayMatching(window.getBounds())
      bounds.x = Math.round(
        scr.bounds.x + scr.bounds.width / 2 - bounds.width / 2
      )
      bounds.y = Math.round(
        scr.bounds.y + scr.bounds.height / 2 - bounds.height / 2
      )
      log.debug(`setBounds: centered to ${JSON.stringify(bounds)}`)
    }
    // Resize the window's content area (so window border doesn't need to be taken
    // into account)
    if (bounds.contentBounds) {
      window.setContentBounds(bounds, true)
    } else {
      window.setBounds(bounds, true)
    }
  } else {
    log.debug('setBounds: not setting bounds because of window maximization')
  }
}

/**
 * Set progress bar to [0, 1]. Indeterminate when > 1. Remove with < 0.
 */
export function setProgress(progress: number) {
  window?.setProgressBar(progress)
}

export function setTitle(title?: string) {
  if (title) {
    window?.setTitle(`${appWindowTitle} - ${title}`)
  } else {
    window?.setTitle(appWindowTitle)
  }
}

export function show() {
  window?.show()
}

export function toggleAlwaysOnTop() {
  if (!window) return
  const flag = !window.isAlwaysOnTop()
  log.info(`toggleAlwaysOnTop ${flag}`)
  window.setAlwaysOnTop(flag)
}

export function isAlwaysOnTop() {
  return window ? window.isAlwaysOnTop() : false
}

export function toggleDevTools() {
  if (!window) return
  log.info('toggleDevTools')
  if (window.webContents.isDevToolsOpened()) {
    window.webContents.closeDevTools()
  } else {
    window.webContents.openDevTools({ mode: 'detach' })
  }
}

export function chooseLanguage(locale: string) {
  window?.webContents.send('chooseLanguage', locale)
}

export function setZoomFactor(factor: number) {
  log.info('setZoomFactor', factor)
  window?.webContents.setZoomFactor(factor)
}
