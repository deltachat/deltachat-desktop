import { app as rawApp, Menu, Tray } from 'electron'
import { globalShortcut } from 'electron'
import * as mainWindow from './windows/main'
import { ExtendedAppMainProcess } from './types'
import { getLogger } from '../shared/logger'
import { appIcon } from './application-constants'

let tray: Tray = null
let contextMenu: Menu = null

const app = rawApp as ExtendedAppMainProcess
const log = getLogger('main/tray')

export function updateTrayIcon() {
  // Don't show a tray icon for mac
  if (process.platform === 'darwin') return

  // User doesn't want tray icon => destroy it
  if (app.state.saved.minimizeToTray !== true) {
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

export function renderTrayIcon() {
  if (tray != null) {
    log.warn('Tray icon not destroyed before render?')
    destroyTrayIcon()
  }

  const tx = app.translate

  // Add tray icon
  log.info('add icon tray')
  tray = new Tray(appIcon())
  const win = mainWindow.window
  contextMenu = Menu.buildFromTemplate([
    {
      id: 'open_windows',
      label: tx('global_menu_file_open_desktop'),
      type: 'normal',
      click() {
        win.show()
      },
    },
    {
      id: 'reduce_window',
      label: tx('global_menu_file_reduce_desktop'),
      type: 'normal',
      accelerator: 'Escape',
      click() {
        win.close()
      },
    },
    {
      id: 'quit_app',
      label: tx('global_menu_file_quit_desktop'),
      type: 'normal',
      click() {
        globalShortcut.unregisterAll()
        if (process.platform !== 'darwin') {
          app.quit()
        }
      },
    },
  ])
  tray.setToolTip('Delta Chat')
  tray.setContextMenu(contextMenu)
  const hideOrShow = () => {
    const isVisibleAndFocused =
      mainWindow.window.isVisible() && mainWindow.window.isFocused()
    isVisibleAndFocused === true
      ? mainWindow.window.minimize()
      : mainWindow.show()
  }
  tray.on('double-click', (event, bounds) => {
    hideOrShow()
  })
  tray.on('click', (event, bounds) => {
    hideOrShow()
  })

  updateTrayMenu()
}

export function updateTrayMenu() {
  if (contextMenu === null) return
  contextMenu.getMenuItemById(
    'reduce_window'
  ).enabled = mainWindow.window.isVisible()

  // Called to update menu on Linux
  tray.setContextMenu(contextMenu)
}
