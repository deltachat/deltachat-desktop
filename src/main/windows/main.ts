import debounce from 'debounce'
import electron, {
  BrowserWindow,
  Rectangle,
  ipcMain,
  EventEmitter,
} from 'electron'
import { appWindowTitle } from '../../shared/constants'
import { getLogger } from '../../shared/logger'
import { appIcon, windowDefaults } from '../application-constants'
import { ExtendedAppMainProcess } from '../types'
const log = getLogger('main/mainWindow')

export let window: (BrowserWindow & { hidden?: boolean }) | null = null

export function init(
  app: ExtendedAppMainProcess,
  options: { hidden: boolean }
) {
  if (window) {
    return window.show()
  }

  const state = app.state
  const defaults = windowDefaults()
  const initialBounds = Object.assign(defaults.bounds, state.saved.bounds)

  window = new electron.BrowserWindow({
    backgroundColor: '#282828',
    // backgroundThrottling: false, // do not throttle animations/timers when page is background
    darkTheme: true, // Forces dark theme (GTK+3)
    height: initialBounds.height,
    icon: appIcon(),
    minHeight: defaults.minHeight,
    minWidth: defaults.minWidth,
    show: false,
    title: appWindowTitle,
    width: initialBounds.width,
    x: initialBounds.x,
    y: initialBounds.y,
    webPreferences: {
      nodeIntegration: false,
      preload: defaults.preload,
    },
  })

  window.loadURL(defaults.main)

  let frontend_ready = false
  ;(app as EventEmitter).once('frontendReady', () => {
    frontend_ready = true
  })

  // Define custom protocol handler. Deep linking works on packaged versions of the application!
  // These calls are for mac and windows, on linux it uses the desktop file.
  app.setAsDefaultProtocolClient('openpgp4fpr')
  app.setAsDefaultProtocolClient('OPENPGP4FPR')

  app.on('open-url', function(event: Event, url: string) {
    if (event) event.preventDefault()
    const sendOpenUrlEvent = () => {
      log.info('open-url: Sending url to frontend.')
      if (frontend_ready) {
        send('open-url', url)
      } else {
        ;(app as EventEmitter).once('frontendReady', () => {
          send('open-url', url)
        })
      }
    }
    log.debug('open-url: sending to frontend:', url)
    if (app.ipcReady) return sendOpenUrlEvent()

    log.debug('open-url: Waiting for ipc to be ready before opening url.')
    ;(app as EventEmitter).once('ipcReady', () => {
      log.debug('open-url: IPC ready.')
      sendOpenUrlEvent()
    })
  })

  // Iterate over arguments and look out for uris
  const openUrlFromArgv = (argv: string[]) => {
    for (let i = 1; i < argv.length; i++) {
      let arg = argv[i]
      if (!arg.startsWith('OPENPGP4FPR:') && !arg.startsWith('openpgp4fpr:')) {
        log.debug("open-url: URI doesn't start with OPENPGP4FPR:", arg)
        continue
      }

      log.debug('open-url: Detected URI: ', arg)
      app.emit('open-url', null, arg)
    }
  }

  openUrlFromArgv(process.argv)

  app.on('second-instance', (event: Event, argv: string[]) => {
    log.debug('Someone tried to run a second instance')
    openUrlFromArgv(argv)
    if (window) {
      if (window.isMinimized()) window.show()
      window.focus()
    }
  })

  window.once('ready-to-show', () => {
    if (!options.hidden) window.show()
    if (process.env.NODE_ENV === 'test') {
      window.maximize()
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

  window.on(
    'move',
    debounce((e: any) => {
      state.saved.bounds = e.sender.getBounds()
      app.saveState()
    }, 1000)
  )

  window.on(
    'resize',
    debounce((e: any) => {
      state.saved.bounds = e.sender.getBounds()
      app.saveState()
    }, 1000)
  )

  window.once('show', () => {
    window.webContents.setZoomFactor(state.saved.zoomFactor)
  })
  window.on('close', () => {})
  window.on('blur', () => {
    window.hidden = true
  })
  window.on('focus', () => {
    window.hidden = false
  })
}

export function hide() {
  window?.hide()
}

export function send(channel: string, ...args: any[]) {
  if (!window) {
    log.warn("window not defined, can't send ipc to renderer")
    return
  }
  window.webContents.send(channel, ...args)
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
