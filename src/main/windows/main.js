const main = module.exports = {
  dispatch,
  hide,
  init,
  send,
  setAspectRatio,
  setBounds,
  setProgress,
  setTitle,
  chooseLanguage,
  show,
  toggleAlwaysOnTop,
  toggleDevTools,
  win: null
}

const electron = require('electron')
const debounce = require('debounce')

const app = electron.app

const config = require('../../config')
const log = require('../log')
const menu = require('../menu')

function init (state, options) {
  if (main.win) {
    return main.win.show()
  }

  const initialBounds = Object.assign(config.WINDOW_INITIAL_BOUNDS, state.saved.bounds)

  const win = main.win = new electron.BrowserWindow({
    backgroundColor: '#282828',
    backgroundThrottling: false, // do not throttle animations/timers when page is background
    darkTheme: true, // Forces dark theme (GTK+3)
    height: initialBounds.height,
    icon: getIconPath(), // Window icon (Windows, Linux)
    minHeight: config.WINDOW_MIN_HEIGHT,
    minWidth: config.WINDOW_MIN_WIDTH,
    show: false,
    title: config.APP_WINDOW_TITLE,
    titleBarStyle: 'hidden-inset', // Hide title bar (Mac)
    useContentSize: true, // Specify web page size without OS chrome
    width: initialBounds.width,
    x: initialBounds.x,
    y: initialBounds.y
  })

  win.loadURL(config.WINDOW_MAIN)

  win.once('ready-to-show', () => {
    if (!options.hidden) win.show()
  })

  if (win.setSheetOffset) {
    win.setSheetOffset(config.UI_HEADER_HEIGHT)
  }

  win.webContents.on('dom-ready', () => {
  })

  win.webContents.on('will-navigate', (e, url) => {
    // Prevent drag-and-drop from navigating the Electron window, which can happen
    // before our drag-and-drop handlers have been initialized.
    e.preventDefault()
  })

  win.on('blur', onWindowBlur)
  win.on('focus', onWindowFocus)

  win.on('hide', onWindowBlur)
  win.on('show', onWindowFocus)

  win.on('move', debounce(e => {
    send('windowBoundsChanged', e.sender.getBounds())
  }, 1000))

  win.on('resize', debounce(e => {
    send('windowBoundsChanged', e.sender.getBounds())
  }, 1000))

  win.on('close', e => {
  })
}

function dispatch (...args) {
  send('dispatch', ...args)
}

function hide () {
  if (!main.win) return
  main.win.hide()
}

function send (...args) {
  if (!main.win) return
  main.win.send(...args)
}

/**
 * Enforce window aspect ratio. Remove with 0. (Mac)
 */
function setAspectRatio (aspectRatio) {
  if (!main.win) return
  main.win.setAspectRatio(aspectRatio)
}

function setBounds (bounds, maximize) {
  // Maximize or minimize, if the second argument is present
  if (maximize === true && !main.win.isMaximized()) {
    log('setBounds: maximizing')
    main.win.maximize()
  } else if (maximize === false && main.win.isMaximized()) {
    log('setBounds: unmaximizing')
    main.win.unmaximize()
  }

  const willBeMaximized = typeof maximize === 'boolean' ? maximize : main.win.isMaximized()
  // Assuming we're not maximized or maximizing, set the window size
  if (!willBeMaximized) {
    log(`setBounds: setting bounds to ${JSON.stringify(bounds)}`)
    if (bounds.x === null && bounds.y === null) {
      // X and Y not specified? By default, center on current screen
      const scr = electron.screen.getDisplayMatching(main.win.getBounds())
      bounds.x = Math.round(scr.bounds.x + (scr.bounds.width / 2) - (bounds.width / 2))
      bounds.y = Math.round(scr.bounds.y + (scr.bounds.height / 2) - (bounds.height / 2))
      log(`setBounds: centered to ${JSON.stringify(bounds)}`)
    }
    // Resize the window's content area (so window border doesn't need to be taken
    // into account)
    if (bounds.contentBounds) {
      main.win.setContentBounds(bounds, true)
    } else {
      main.win.setBounds(bounds, true)
    }
  } else {
    log('setBounds: not setting bounds because of window maximization')
  }
}

/**
 * Set progress bar to [0, 1]. Indeterminate when > 1. Remove with < 0.
 */
function setProgress (progress) {
  if (!main.win) return
  main.win.setProgressBar(progress)
}

function setTitle (title) {
  if (!main.win) return
  main.win.setTitle(title)
}

function show () {
  if (!main.win) return
  main.win.show()
}

// Sets whether the window should always show on top of other windows
function toggleAlwaysOnTop (flag) {
  if (!main.win) return
  if (flag == null) {
    flag = !main.win.isAlwaysOnTop()
  }
  log(`toggleAlwaysOnTop ${flag}`)
  main.win.setAlwaysOnTop(flag)
  menu.onToggleAlwaysOnTop(flag)
}

function toggleDevTools () {
  if (!main.win) return
  log('toggleDevTools')
  if (main.win.webContents.isDevToolsOpened()) {
    main.win.webContents.closeDevTools()
  } else {
    main.win.webContents.openDevTools({ mode: 'detach' })
  }
}

function onWindowBlur () {
  menu.setWindowFocus(false)
}

function onWindowFocus () {
  menu.setWindowFocus(true)
}

function getIconPath () {
  return process.platform === 'win32'
    ? config.APP_ICON + '.ico'
    : config.APP_ICON + '.png'
}

function chooseLanguage (locale) {
  main.win.send('chooseLanguage', locale)
}
