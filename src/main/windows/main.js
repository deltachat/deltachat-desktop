const main = module.exports = {
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
  isAlwaysOnTop,
  toggleDevTools,
  win: null
}

const electron = require('electron')
const debounce = require('debounce')

/* *CONFIG* */
const config = require('../../config')
const { appIcon } = require('../../application-constants')
const log = require('../../logger').getLogger('main/mainWindow')

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
    icon: appIcon(),
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

  win.on('move', debounce(e => {
    send('windowBoundsChanged', e.sender.getBounds())
  }, 1000))

  win.on('resize', debounce(e => {
    send('windowBoundsChanged', e.sender.getBounds())
  }, 1000))

  win.on('close', e => {
  })
  win.on('blur', e => {
    win.hidden = true
  })
  win.on('focus', e => {
    win.hidden = false
  })
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
    log.debug('setBounds: maximizing')
    main.win.maximize()
  } else if (maximize === false && main.win.isMaximized()) {
    log.debug('setBounds: unmaximizing')
    main.win.unmaximize()
  }

  const willBeMaximized = typeof maximize === 'boolean' ? maximize : main.win.isMaximized()
  // Assuming we're not maximized or maximizing, set the window size
  if (!willBeMaximized) {
    log.debug(`setBounds: setting bounds to ${JSON.stringify(bounds)}`, bounds, 'set_bounds_to')
    if (bounds.x === null && bounds.y === null) {
      // X and Y not specified? By default, center on current screen
      const scr = electron.screen.getDisplayMatching(main.win.getBounds())
      bounds.x = Math.round(scr.bounds.x + (scr.bounds.width / 2) - (bounds.width / 2))
      bounds.y = Math.round(scr.bounds.y + (scr.bounds.height / 2) - (bounds.height / 2))
      log.debug(`setBounds: centered to ${JSON.stringify(bounds)}`, bounds, 'set_bounds_centered_to')
    }
    // Resize the window's content area (so window border doesn't need to be taken
    // into account)
    if (bounds.contentBounds) {
      main.win.setContentBounds(bounds, true)
    } else {
      main.win.setBounds(bounds, true)
    }
  } else {
    log.debug('setBounds: not setting bounds because of window maximization')
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
  if (title) {
    main.win.setTitle(`${config.APP_WINDOW_TITLE} - ${title}`)
  } else {
    main.win.setTitle(config.APP_WINDOW_TITLE)
  }
}

function show () {
  if (!main.win) return
  main.win.show()
}

function toggleAlwaysOnTop () {
  if (!main.win) return
  const flag = !main.win.isAlwaysOnTop()
  log.info(`toggleAlwaysOnTop ${flag}`)
  main.win.setAlwaysOnTop(flag)
}

function isAlwaysOnTop () {
  return main.win ? main.win.isAlwaysOnTop() : false
}

function toggleDevTools () {
  if (!main.win) return
  log.info('toggleDevTools')
  if (main.win.webContents.isDevToolsOpened()) {
    main.win.webContents.closeDevTools()
  } else {
    main.win.webContents.openDevTools({ mode: 'detach' })
  }
}

function chooseLanguage (locale) {
  main.win.send('chooseLanguage', locale)
}
