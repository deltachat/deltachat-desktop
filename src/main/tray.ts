import { app as rawApp, Menu, Tray } from 'electron'
import { globalShortcut } from 'electron'
import path from 'path'
import * as mainWindow from './windows/main'
import { ExtendedAppMainProcess } from './types'

let tray = null

const app = rawApp as ExtendedAppMainProcess

export function updateTrayIcon() {
  const tx = app.translate

  const IsMac = process.platform === 'darwin'
  if (!IsMac && app.state.saved.minimizeToTray) {
    // Add tray icon
    tray = new Tray(
      `${path.join(__dirname, '..', '..', 'images', 'deltachat.ico')}`
    )
    const win = mainWindow.window
    const contextMenu = Menu.buildFromTemplate([
      {
        label: tx('global_menu_file_open_desktop'),
        type: 'normal',
        click() {
          win.show()
        },
      },
      {
        label: tx('global_menu_file_reduce_desktop'),
        type: 'normal',
        accelerator: 'Escape',
        click() {
          win.close()
        },
      },
      {
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
    tray.on('double-click', (event, bounds) => {
      mainWindow.show()
    })
  }
}
