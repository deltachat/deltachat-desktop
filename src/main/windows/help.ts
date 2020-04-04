import { app as rawApp, BrowserWindow, Menu, shell } from 'electron'
import { appIcon } from '../application-constants'
import { getLogger } from '../../shared/logger'
import { ExtendedAppMainProcess } from '../types'
import { join } from 'path'
import { pathExists } from 'fs-extra'
import { appWindowTitle } from '../../shared/constants'

const log = getLogger('main/help')
const app = rawApp as ExtendedAppMainProcess

async function getHelpFileForLang(locale: string) {
  const appPath = app.getAppPath()

  const contentFilePath = join(appPath, `/html-dist/help/${locale}/help.html`)
  if (await pathExists(contentFilePath)) {
    return contentFilePath
  } else {
    log.warn(
      `Did not found help file for language ${locale}, falling back to english`
    )
    return join(appPath, `/html-dist/help/en/help.html`)
  }
}

let win: BrowserWindow | null = null

export async function openHelpWindow(locale: string) {
  if (win) {
    win.focus()
    return
  }

  log.debug('open help', locale)
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
    title: appWindowTitle + '-' + app.translate('menu_help'),
    titleBarStyle: 'hiddenInset', // Hide title bar (Mac)
    useContentSize: true, // Specify web page size without OS chrome

    webPreferences: {
      nodeIntegration: false,
    },
  })

  const url = await getHelpFileForLang(locale)

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

  win.on('close', e => {
    win = null
  })

  win.setMenu(Menu.buildFromTemplate([{ role: 'viewMenu' }]))

  win.webContents.executeJavaScript(`
    const body = document.getElementsByTagName('body')[0];
    const back_btn = document.createElement('button');
    back_btn.className = 'back-btn';
    back_btn.onclick = (ev) => {document.body.scrollTop = 0; document.documentElement.scrollTop = 0;};
    back_btn.innerText = '↑ ${app.translate('back_to_top')}';
    body.append(back_btn);
  `)
}
