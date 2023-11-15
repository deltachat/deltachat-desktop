import { app as rawApp, BrowserWindow, Menu, shell } from 'electron'
import { appIcon, htmlDistDir } from '../application-constants'
import { getLogger } from '../../shared/logger'
import { ExtendedAppMainProcess } from '../types'
import { join } from 'path'
import { stat } from 'fs/promises'
import { appWindowTitle } from '../../shared/constants'
import { tx } from '../load-translations'
import { window as main_window } from '../windows/main'

const log = getLogger('main/help')
const app = rawApp as ExtendedAppMainProcess

async function getHelpFileForLang(locale: string) {
  const appPath = app.getAppPath()

  const contentFilePath = join(appPath, `/html-dist/help/${locale}/help.html`)
  if ((await stat(contentFilePath)).isFile()) {
    return join(htmlDistDir(), `help/${locale}/help.html`)
  } else {
    log.warn(
      `Did not find help file for language ${locale}, falling back to english`
    )
    return join(htmlDistDir(), `help/en/help.html`)
  }
}

let win: BrowserWindow | null = null

export async function openHelpWindow(locale: string, anchor?: string) {
  if (win) {
    win.focus()
    if (anchor) {
      win.webContents.executeJavaScript(`
        document.getElementById(atob("${btoa(
          anchor
        )}"))?.scrollIntoView({"behavior":"smooth"})
      `)
    }
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
  const help_window = (win = new BrowserWindow({
    backgroundColor: '#282828',
    darkTheme: true, // Forces dark theme (GTK+3)

    icon: appIcon(),
    minHeight: defaults.minHeight,
    minWidth: defaults.minWidth,
    show: false,
    title: appWindowTitle + ' - ' + tx('menu_help'),
    useContentSize: true, // Specify web page size without OS chrome

    webPreferences: {
      contextIsolation: true,
      sandbox: true,
      spellcheck: false,
    },
    alwaysOnTop: main_window?.isAlwaysOnTop(),
  }))

  const url = await getHelpFileForLang(locale)

  log.debug(url)

  win.loadFile(url)

  win.once('ready-to-show', async () => {
    if (anchor) {
      await help_window.webContents.executeJavaScript(`
      document.getElementById(atob("${btoa(
        anchor
      )}"))?.scrollIntoView({"behavior":"instant"})
      `)
    }
    help_window.show()
  })

  if (win.setSheetOffset) {
    win.setSheetOffset(defaults.headerHeight)
  }

  win.webContents.on('will-navigate', (_ev, url) => {
    log.debug('open ', url)
    shell.openExternal(url)
  })

  win.on('close', _e => {
    win = null
  })

  win.setMenu(Menu.buildFromTemplate([{ role: 'viewMenu' }]))

  win.webContents.executeJavaScript(`
    const body = document.getElementsByTagName('body')[0];
    const back_btn = document.createElement('button');
    back_btn.className = 'back-btn';
    back_btn.onclick = (ev) => {document.body.scrollTop = 0; document.documentElement.scrollTop = 0;};
    back_btn.innerText = '↑ ${tx('menu_scroll_to_top')}';
    body.append(back_btn);
  `)

  // help does not need web permissions so deny all
  win.webContents.session.setPermissionCheckHandler((_wc, _permission) => false)
  win.webContents.session.setPermissionRequestHandler(
    (_wc, _permission, callback) => callback(false)
  )
}
