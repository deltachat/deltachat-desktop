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

export function mainWindowIsVisibleAndFocused() {
  return mainWindow.window.isVisible() && mainWindow.window.isFocused()
}

export function closeDeltaChat() {
  mainWindow.window.close()
  setTrayMenu()
}

export function hideDeltaChat() {
  mainWindow.window.hide()
  setTrayMenu()
}

export function showDeltaChat() {
  mainWindow.window.show()
  setTrayMenu()
}

export function quitDeltaChat() {
  globalShortcut.unregisterAll()
  app.quit()
}

export function updateTrayIcon() {
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

export function setTrayMenu() {

  const tx = app.translate
  if (process.platform === 'darwin') {
    contextMenu = Menu.buildFromTemplate([
      mainWindowIsVisibleAndFocused() ?
        {
          id: 'reduce_window',
          label: tx('hide'),
          type: 'normal',
          click() {
            hideDeltaChat()
          },
        } :
        {
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
 
  tray.setContextMenu(contextMenu)
}

export function TrayIcon() {
  let tray 
  if (process.platform === 'darwin') {
    let image = nativeImage.createFromPath(join(__dirname, '..', '..', 'images', 'trayIconTemplate.png')).resize({width: 24})
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

  setTrayMenu()

  tray.setToolTip('Delta Chat')
  const hideOrShow = () => {
    const isVisibleAndFocused =
      mainWindow.window.isVisible() && mainWindow.window.isFocused()
    isVisibleAndFocused === true
      ? mainWindow.window.minimize()
      : mainWindow.show()
  }
  tray.on('double-click', () => {
    hideOrShow()
  })
  tray.on('click', () => {
    hideOrShow()
  })
  if(process.platform === 'darwin') {
    tray.on('right-click', () => tray.popUpContextMenu())
  }

  updateTrayMenu()
}

export function updateTrayMenu() {
  if (contextMenu === null) return
  const reduceWindowItem = contextMenu.getMenuItemById(
    'reduce_window'
  )
  if (reduceWindowItem) {
    reduceWindowItem.enabled = mainWindow.window.isVisible()
  }

  // Called to update menu on Linux
  tray.setContextMenu(contextMenu)
}
