import { app as rawApp, BrowserWindow, Menu, shell } from 'electron'
import { appIcon } from '../application-constants'
import { getLogger } from '../../shared/logger'
import { ExtendedAppMainProcess } from '../types'
//import { appWindowTitle } from '../../shared/constants'

const log = getLogger('main/call')
//const app = rawApp as ExtendedAppMainProcess


let win: BrowserWindow | null = null

export async function openCallWindow(locale: string, callUrl : string) {
  if (win) {
    win.focus()
    return
  }

  log.debug('open call', callUrl)
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
    backgroundColor: '#282828',
    darkTheme: true, // Forces dark theme (GTK+3)

    icon: appIcon(),
    minHeight: defaults.minHeight,
    minWidth: defaults.minWidth,
    show: false,
    title: 'WebRTC Call',
    useContentSize: true, // Specify web page size without OS chrome

    webPreferences: {
      nodeIntegration: false,
    },
  })

  log.debug(callUrl)

  win.loadURL(callUrl)

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

  win.on('close', e => {
    win = null
  })

  win.setMenu(Menu.buildFromTemplate([{ role: 'viewMenu' }]))

}
