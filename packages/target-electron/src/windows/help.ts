import { BrowserWindow, Menu, shell } from 'electron'
import { join } from 'path'
import { stat } from 'fs/promises'
import { platform } from 'os'

import { appIcon, htmlDistDir } from '../application-constants.js'
import { getLogger } from '../../../shared/logger.js'
import { appWindowTitle } from '../../../shared/constants.js'
import { tx } from '../load-translations.js'
import { window as main_window } from './main.js'
import {
  getAppMenu,
  getFileMenu,
  getHelpMenu,
  refresh as refreshTitleMenu,
} from '../menu.js'
import { initMinWinDimensionHandling } from './helpers.js'
import { setContentProtection } from '../content-protection.js'

const log = getLogger('main/help')

async function getHelpFileForLang(locale: string) {
  const contentFilePath = join(htmlDistDir(), `help/${locale}/help.html`)
  try {
    if (!(await stat(join(contentFilePath))).isFile()) {
      log.warn('contentFilePath not a file')
      throw new Error('contentFilePath not a file')
    }
    return contentFilePath
  } catch (_error) {
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

  setContentProtection(help_window)

  const removeScreenChangeListeners = initMinWinDimensionHandling(
    help_window,
    defaults.minWidth,
    defaults.minHeight
  )

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
    removeScreenChangeListeners()
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

  const isMac = platform() === 'darwin'

  // copied and adapted from webxdc menu
  // TODO: would make sense to refactor these menus at some point
  const makeMenu = () => {
    return Menu.buildFromTemplate([
      ...(isMac ? [getAppMenu(help_window)] : []),
      getFileMenu(win, isMac),
      {
        label: tx('global_menu_edit_desktop'),
        submenu: [
          {
            label: tx('global_menu_edit_copy_desktop'),
            role: 'copy',
          },
          {
            label: tx('menu_select_all'),
            role: 'selectAll',
          },
        ],
      },
      {
        label: tx('global_menu_view_desktop'),
        submenu: [
          {
            accelerator: 'CmdOrCtrl+=',
            label: tx('menu_zoom_in'),
            role: 'zoomIn',
          },
          {
            accelerator: 'CmdOrCtrl+-',
            label: tx('menu_zoom_out'),
            role: 'zoomOut',
          },
          {
            accelerator: 'CmdOrCtrl+0',
            label: `${tx('reset')}`,
            role: 'resetZoom',
          },
          { type: 'separator' },
          {
            label: tx('global_menu_view_floatontop_desktop'),
            type: 'checkbox',
            checked: win?.isAlwaysOnTop(),
            click: () => {
              win?.setAlwaysOnTop(!win.isAlwaysOnTop())
              if (isMac) {
                win?.setMenu(makeMenu())
              } else {
                // change to window menu
                Menu.setApplicationMenu(makeMenu())
              }
            },
          },
          { role: 'togglefullscreen' },
        ],
      },
      getHelpMenu(isMac),
    ])
  }

  if (!isMac) {
    win.setMenu(makeMenu())
  }

  win.on('focus', () => {
    if (isMac) {
      // change to help menu
      Menu.setApplicationMenu(makeMenu())
    }
  })
  win.on('blur', () => {
    if (isMac) {
      // change back to main-window menu
      refreshTitleMenu()
    }
  })
}
