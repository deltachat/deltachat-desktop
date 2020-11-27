import { BrowserWindow, Menu, shell, ipcMain } from 'electron'
import { appIcon } from '../application-constants'
import { getLogger } from '../../shared/logger'
import { join } from 'path'

//import { appWindowTitle } from '../../shared/constants'

const log = getLogger('main/videoHangoutWindow')

let win: BrowserWindow | null = null

export async function openCallWindow(_locale: string, options: string) {
  if (win) {
    win.focus()
    return
  }

  log.debug('open call', options)
  const defaults = {
    bounds: {
      width: 500,
      height: 638,
    },
    headerHeight: 36,
    minWidth: 450,
    minHeight: 450,
  }
  win = new BrowserWindow({
    backgroundColor: 'white',
    darkTheme: false, // Forces dark theme (GTK+3)

    icon: appIcon(),
    minHeight: defaults.minHeight,
    minWidth: defaults.minWidth,
    show: false,
    title: 'Video Chat',
    useContentSize: true, // Specify web page size without OS chrome

    webPreferences: {
      nodeIntegration: false,
      preload: join(__dirname, '../../../static/preload-call.js'),
    },
  })

  const url =
    join(__dirname, '../../..//html-dist/call/index.html') + '#' + options
  log.debug(url)
  win.loadURL('file://' + url)

  win.once('ready-to-show', () => {
    win.show()
  })

  if (win.setSheetOffset) {
    win.setSheetOffset(defaults.headerHeight)
  }

  win.webContents.on('will-navigate', (_ev, url) => {
    log.debug('open ', url)
    shell.openExternal(url)
  })

  const closeButtonCallback = () => {
    win.close()
  }
  ipcMain.addListener('call-close', closeButtonCallback)
  win.on('close', _e => {
    ipcMain.removeListener('call-close', closeButtonCallback)
    win = null
  })

  win.setMenu(Menu.buildFromTemplate([{ role: 'viewMenu' }]))
}
