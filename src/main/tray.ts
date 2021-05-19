import { app as rawApp, Menu, Tray, nativeImage } from 'electron'
import { globalShortcut } from 'electron'
import * as mainWindow from './windows/main'
import { ExtendedAppMainProcess } from './types'
import { getLogger } from '../shared/logger'
import { appIcon } from './application-constants'
import { join } from 'path'

let tray: Tray = null
let contextMenu: Menu = null

const app = rawApp as ExtendedAppMainProcess
const log = getLogger('main/tray')

export function mainWindowIsVisible() {
  if (process.platform === 'darwin' || process.platform === 'win32') {
    return mainWindow.window.isVisible()
  }
  return mainWindow.window.isVisible() && mainWindow.window.isFocused()
}

export function closeDeltaChat() {
  mainWindow.window.close()
}

export function hideDeltaChat(minimize?: boolean) {
  if (minimize === true) {
    mainWindow.window.minimize()
  }
  mainWindow.window.hide()
  if (process.platform === 'linux') tray.setContextMenu(getTrayMenu())
}

export function showDeltaChat() {
  mainWindow.window.show()
}

export function hideOrShowDeltaChat() {
  mainWindowIsVisible() ? hideDeltaChat(true) : showDeltaChat()
}

export function quitDeltaChat() {
  globalShortcut.unregisterAll()
  app.quit()
}

export function updateTrayIcon() {
  // User doesn't want tray icon => destroy it
  if (!app.rc['minimized'] && app.state.saved.minimizeToTray !== true) {
    if (tray != null) destroyTrayIcon()
    return
  }

  renderTrayIcon()
}

export function destroyTrayIcon() {
  log.info('destroy icon tray')
  tray.destroy()
  tray = null
}

export function getTrayMenu() {
  if (tray === null) return
  const tx = app.translate
  if (process.platform === 'darwin') {
    contextMenu = Menu.buildFromTemplate([
      mainWindowIsVisible()
        ? {
            id: 'reduce_window',
            label: tx('hide'),
            type: 'normal',
            click() {
              hideDeltaChat()
            },
          }
        : {
            id: 'open_windows',
            label: tx('activate'),
            type: 'normal',
            click() {
              showDeltaChat()
            },
          },

      {
        id: 'quit_app',
        label: tx('global_menu_file_quit_desktop'),
        type: 'normal',
        click() {
          quitDeltaChat()
        },
      },
    ])
  } else {
    // is windows/linux
    contextMenu = Menu.buildFromTemplate([
      {
        id: 'open_windows',
        label: tx('global_menu_file_open_desktop'),
        type: 'normal',
        click() {
          showDeltaChat()
        },
      },
      {
        id: 'reduce_window',
        label: tx('global_menu_minimize_to_tray'),
        type: 'normal',
        enabled: mainWindowIsVisible(),
        click() {
          hideDeltaChat()
        },
      },
      {
        id: 'quit_app',
        label: tx('global_menu_file_quit_desktop'),
        type: 'normal',
        click() {
          quitDeltaChat()
        },
      },
    ])
  }

  return contextMenu
}

export function TrayIcon() {
  let tray
  if (process.platform === 'darwin') {
    const image = nativeImage
      .createFromPath(
        join(__dirname, '..', '..', 'images', 'trayIconTemplate.png')
      )
      .resize({ width: 24 })
    image.setTemplateImage(true)
    tray = new Tray(image)
  } else {
    tray = new Tray(appIcon())
  }

  return tray
}

export function renderTrayIcon() {
  if (tray != null) {
    log.warn('Tray icon not destroyed before render?')
    destroyTrayIcon()
  }

  // Add tray icon
  log.info('add icon tray')
  tray = TrayIcon()

  tray.setToolTip('Delta Chat')

  if (process.platform === 'darwin') {
    tray.on('click', () => tray.popUpContextMenu(getTrayMenu()))
    tray.on('right-click', () => tray.popUpContextMenu(getTrayMenu()))
  } else if (process.platform === 'win32') {
    tray.on('click', hideOrShowDeltaChat)
    tray.on('right-click', () => tray.popUpContextMenu(getTrayMenu()))
  } else {
    tray.on('click', hideOrShowDeltaChat)
    tray.on('double-click', hideOrShowDeltaChat)

    tray.setContextMenu(getTrayMenu())
    mainWindow.window.on('blur', () => tray.setContextMenu(getTrayMenu()))
    mainWindow.window.on('focus', () => tray.setContextMenu(getTrayMenu()))
  }
}
