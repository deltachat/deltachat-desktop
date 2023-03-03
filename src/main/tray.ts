import { app as rawApp, Menu, Tray, nativeImage, NativeImage } from 'electron'
import { globalShortcut } from 'electron'
import * as mainWindow from './windows/main'
import { ExtendedAppMainProcess } from './types'
import { getLogger } from '../shared/logger'
import { join } from 'path'
import { DesktopSettings } from './desktop_settings'
import { tx } from './load-translations'

let tray: Tray | null = null
let contextMenu: Menu | null = null

const app = rawApp as ExtendedAppMainProcess
const log = getLogger('main/tray')

let has_unread = false

export function set_has_unread(new_has_unread: boolean) {
  has_unread = new_has_unread
  if (tray) {
    tray.setImage(TrayImage())
  }
}

function TrayImage(): string | NativeImage {
  const trayIconFolder = join(__dirname, '..', '..', 'images/tray')
  if (process.platform === 'darwin') {
    const image = nativeImage
      .createFromPath(join(trayIconFolder, 'tray-icon-mac.png'))
      .resize({ width: 24 })
    image.setTemplateImage(true)
    return image
  } else {
    const iconFormat = process.platform === 'win32' ? '.ico' : '.png'

    return `${join(
      trayIconFolder,
      (has_unread ? 'deltachat-unread' : 'deltachat') + iconFormat
    )}`
  }
}

function mainWindowIsVisible() {
  if (!mainWindow.window) {
    throw new Error('window does not exist, this should never happen')
  }
  if (process.platform === 'darwin' || process.platform === 'win32') {
    return mainWindow.window.isVisible()
  }
  return mainWindow.window.isVisible() && mainWindow.window.isFocused()
}

export function hideDeltaChat(minimize?: boolean) {
  if (!mainWindow.window) {
    throw new Error('window does not exist, this should never happen')
  }
  if (minimize === true) {
    mainWindow.window.minimize()
  }
  mainWindow.window.hide()
  if (process.platform === 'linux') tray?.setContextMenu(getTrayMenu() as Menu)
}

export function showDeltaChat() {
  if (!mainWindow.window) {
    throw new Error('window does not exist, this should never happen')
  }
  mainWindow.window.show()
}

function hideOrShowDeltaChat() {
  mainWindowIsVisible() ? hideDeltaChat(true) : showDeltaChat()
}

function quitDeltaChat() {
  globalShortcut.unregisterAll()
  app.quit()
}

export function updateTrayIcon() {
  // User doesn't want tray icon => destroy it
  if (!app.rc['minimized'] && DesktopSettings.state.minimizeToTray !== true) {
    if (tray != null) destroyTrayIcon()
    return
  }

  renderTrayIcon()
}

function destroyTrayIcon() {
  log.info('destroy icon tray')
  tray?.destroy()
  tray = null
}

function getTrayMenu() {
  if (tray === null) return
  if (process.platform === 'darwin') {
    contextMenu = Menu.buildFromTemplate([
      mainWindowIsVisible()
        ? {
            id: 'reduce_window',
            label: tx('hide'),
            type: 'normal',
            click() {
              hideDeltaChat()
              // fix #3041
              refreshTrayContextMenu()
            },
          }
        : {
            id: 'open_windows',
            label: tx('activate'),
            type: 'normal',
            click() {
              showDeltaChat()
              // fix #3041
              refreshTrayContextMenu()
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

function TrayIcon() {
  return new Tray(TrayImage())
}

function renderTrayIcon() {
  if (tray != null) {
    log.warn('Tray icon not destroyed before render?')
    destroyTrayIcon()
  }

  // Add tray icon
  log.info('add icon tray')
  tray = TrayIcon()

  tray.setToolTip('Delta Chat')

  if (process.platform === 'darwin') {
    tray.on('click', () => tray?.popUpContextMenu(getTrayMenu()))
    tray.on('right-click', () => tray?.popUpContextMenu(getTrayMenu()))
  } else if (process.platform === 'win32') {
    tray.on('click', hideOrShowDeltaChat)
    tray.on('right-click', () => tray?.popUpContextMenu(getTrayMenu()))
  } else {
    tray.on('click', hideOrShowDeltaChat)
    tray.on('double-click', hideOrShowDeltaChat)

    refreshTrayContextMenu()
  }
}

export function refreshTrayContextMenu() {
  tray?.setContextMenu(getTrayMenu() as Menu)
}
