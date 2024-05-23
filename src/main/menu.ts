import { BrowserWindow, Menu, shell } from 'electron'
import { readFileSync } from 'fs'
import { basename, join, dirname } from 'path'
import { fileURLToPath } from 'url'

import {
  gitHubIssuesUrl,
  gitHubUrl,
  homePageUrl,
  appWindowTitle,
} from '../shared/constants.js'
import { getLogger } from '../shared/logger.js'
import { getConfigPath, getLogsPath } from './application-constants.js'
import { LogHandler } from './log-handler.js'
import * as mainWindow from './windows/main.js'
import { DesktopSettings } from './desktop_settings.js'
import { getCurrentLocaleDate, tx } from './load-translations.js'
import { appx, getAppxPath } from './isAppx.js'

const __dirname = dirname(fileURLToPath(import.meta.url))

const log = getLogger('main/menu')

const languages: {
  locale: string
  name: string
}[] = (() => {
  const languagesFile = join(__dirname, '../../_locales/_languages.json')
  const rawLanguageList: { [locale: string]: string } = JSON.parse(
    readFileSync(languagesFile, 'utf8')
  )

  return Object.keys(rawLanguageList)
    .map(locale => ({
      locale: locale,
      name: rawLanguageList[locale],
    }))
    .filter(({ name }) => name.indexOf('*') === -1)
    .sort(({ name: name1 }, { name: name2 }) => (name1 > name2 ? 1 : -1))
})()

let logHandlerRef: LogHandler | null = null

export function refresh() {
  log.info(`rebuilding menu with locale ${getCurrentLocaleDate().locale}`)
  if (!logHandlerRef) {
    log.critical('logHandlerRef not defined, could not build menu')
    return
  }
  const template = getMenuTemplate(logHandlerRef)
  const menu = Menu.buildFromTemplate(template)
  const item = getMenuItem(menu, tx('global_menu_view_floatontop_desktop'))
  if (item) item.checked = mainWindow.isAlwaysOnTop()
  const isMac = process.platform === 'darwin'
  if (isMac === true) {
    Menu.setApplicationMenu(menu)
    return
  }
  mainWindow.window?.setMenu(menu)
}

export function init(logHandler: LogHandler) {
  logHandlerRef = logHandler
  refresh()
}

interface rawMenuItem extends Electron.MenuItemConstructorOptions {
  translate?: string
  submenu?: (rawMenuItem | Electron.MenuItemConstructorOptions)[]
}

function getAvailableLanguages(): Electron.MenuItemConstructorOptions[] {
  const { locale: currentLocale } = getCurrentLocaleDate()
  return languages.map(({ locale, name }) => {
    return {
      label: name,
      type: 'radio',
      checked: locale === currentLocale,
      click: () => {
        DesktopSettings.update({ locale })
        mainWindow.chooseLanguage(locale)
      },
    }
  })
}

function getZoomFactors(): Electron.MenuItemConstructorOptions[] {
  // for now this solution is electron specific
  const zoomFactors = [
    { scale: 0.6, key: 'extra_small' },
    { scale: 0.8, key: 'small' },
    { scale: 1.0, key: 'normal' },
    { scale: 1.2, key: 'large' },
    { scale: 1.4, key: 'extra_large' },
  ]

  const currentZoomFactor = DesktopSettings.state.zoomFactor

  if (zoomFactors.map(({ scale }) => scale).indexOf(currentZoomFactor) === -1)
    zoomFactors.push({
      scale: currentZoomFactor,
      key: 'custom',
    })

  return zoomFactors.map(({ key, scale }) => {
    return {
      label: !(scale === 1 && key === 'custom')
        ? `${scale}x ${tx(key)}`
        : tx('custom'),
      type: 'radio',
      checked:
        scale === DesktopSettings.state.zoomFactor &&
        !(scale === 1 && key === 'custom'),
      click: () => {
        if (key !== 'custom') {
          DesktopSettings.update({ zoomFactor: scale })
          mainWindow.setZoomFactor(scale)
        } else {
          // todo? currently it is a no-op and the 'option' is only shown
          // when the config value was changed by the user
        }
      },
    }
  })
}

export function getAppMenu(
  isMainWindow: boolean
): Electron.MenuItemConstructorOptions {
  const extraItemsForMainWindow: rawMenuItem[] = [
    {
      label: tx('global_menu_help_about_desktop'),
      click: () => {
        mainWindow.send('showAboutDialog')
      },
    },
    { type: 'separator' },
    {
      label: tx('menu_settings'),
      click: () => {
        mainWindow.send('showSettingsDialog')
      },
      accelerator: 'Cmd+,',
    },
    { type: 'separator' },
  ]

  return {
    label: appWindowTitle,
    submenu: [
      ...(isMainWindow ? extraItemsForMainWindow : []),
      { role: 'hide' },
      { role: 'hideOthers' },
      { role: 'unhide' },
      { type: 'separator' },
      ...(isMainWindow
        ? [
            {
              // because menubar stays when it's closed and apple wants that the user can reopen it via the menu bar
              label: tx('show_window'),
              click: () => {
                mainWindow.show()
              },
            },
          ]
        : []),
      {
        label: tx('global_menu_file_quit_desktop'),
        role: 'quit',
        accelerator: 'Cmd+q',
      },
    ],
  }
}

export function getFileMenu(
  window: BrowserWindow | null,
  isMac: boolean
): Electron.MenuItemConstructorOptions {
  const fileMenuNonMac: Electron.MenuItemConstructorOptions = {
    label: tx('global_menu_file_desktop'),
    submenu: [
      {
        label: tx('menu_settings'),
        click: () => {
          mainWindow.send('showSettingsDialog')
        },
        accelerator: 'Ctrl+,',
      },
      {
        label: tx('global_menu_file_quit_desktop'),
        role: 'quit',
        accelerator: 'Ctrl+q',
      },
    ],
  }
  const fileMenuMac: Electron.MenuItemConstructorOptions = {
    label: tx('global_menu_file_desktop'),
    submenu: [
      {
        label: tx('close_window'),
        click: () => {
          window?.close()
          if (isMac) {
            // change back to main-window menu
            refresh()
          }
        },
        accelerator: isMac ? 'Cmd+w' : 'Ctrl+w',
      },
    ],
  }

  return isMac ? fileMenuMac : fileMenuNonMac
}

export function getEditMenu(): Electron.MenuItemConstructorOptions {
  return {
    label: tx('global_menu_edit_desktop'),
    submenu: [
      {
        label: tx('global_menu_edit_undo_desktop'),
        role: 'undo',
      },
      {
        label: tx('global_menu_edit_redo_desktop'),
        role: 'redo',
      },
      {
        type: 'separator',
      },
      {
        label: tx('global_menu_edit_cut_desktop'),
        role: 'cut',
      },
      {
        label: tx('global_menu_edit_copy_desktop'),
        role: 'copy',
      },
      {
        label: tx('global_menu_edit_paste_desktop'),
        role: 'paste',
      },
      {
        label: tx('delete'),
        role: 'delete',
      },
      {
        label: tx('menu_select_all'),
        role: 'selectAll',
      },
    ],
  }
}

export function getHelpMenu(
  isMac: boolean
): Electron.MenuItemConstructorOptions {
  return {
    label: tx('global_menu_help_desktop'),
    role: 'help',
    submenu: [
      {
        label: tx('menu_help'),
        click: () => {
          mainWindow.send('showHelpDialog')
        },
        accelerator: 'F1',
      },
      {
        label: tx('keybindings'),
        click: () => {
          mainWindow.window?.show()
          mainWindow.window?.focus()
          mainWindow.send('showKeybindingsDialog')
        },
        accelerator: isMac ? 'Cmd+/' : 'Ctrl+/',
      },
      {
        label: tx('global_menu_help_learn_desktop'),
        click: () => {
          shell.openExternal(homePageUrl)
        },
      },
      {
        label: tx('global_menu_help_contribute_desktop'),
        click: () => {
          shell.openExternal(gitHubUrl)
        },
      },
      {
        type: 'separator',
      },
      {
        label: tx('global_menu_help_report_desktop'),
        click: () => {
          shell.openExternal(gitHubIssuesUrl)
        },
      },
      {
        label: tx('global_menu_help_about_desktop'),
        click: () => {
          mainWindow.window?.show()
          mainWindow.window?.focus()
          mainWindow.send('showAboutDialog')
        },
      },
    ],
  }
}

function getMenuTemplate(
  logHandler: LogHandler
): Electron.MenuItemConstructorOptions[] {
  const isMac = process.platform === 'darwin'
  return [
    ...(isMac ? [getAppMenu(true)] : []),
    getFileMenu(mainWindow.window, isMac),
    getEditMenu(),
    {
      label: tx('global_menu_view_desktop'),
      submenu: [
        {
          label: tx('global_menu_view_floatontop_desktop'),
          type: 'checkbox',
          click: () => mainWindow.toggleAlwaysOnTop(),
        },
        {
          label: tx('zoom'),
          submenu: getZoomFactors(),
        },
        {
          label: tx('pref_language'),
          submenu: getAvailableLanguages(),
        },
        {
          type: 'separator',
        },
        {
          label: tx('global_menu_view_developer_desktop'),
          submenu: [
            {
              label: tx('global_menu_view_developer_tools_desktop'),
              accelerator:
                process.platform === 'darwin'
                  ? 'Alt+Command+I'
                  : 'Ctrl+Shift+I',
              click: () => mainWindow.toggleDevTools(),
            },
            {
              label: tx('menu.view.developer.open.log.folder'),
              click: () => {
                if (appx) {
                  shell.openPath(
                    getLogsPath().replace(
                      getConfigPath(),
                      getAppxPath(getConfigPath())
                    )
                  )
                } else {
                  shell.openPath(getLogsPath())
                }
              },
            },
            {
              label: tx('menu.view.developer.open.current.log.file'),
              click: () => {
                if (appx) {
                  const file = join(
                    getLogsPath().replace(
                      getConfigPath(),
                      getAppxPath(getConfigPath())
                    ),
                    basename(logHandler.logFilePath())
                  )
                  shell.openPath(file)
                } else {
                  shell.openPath(logHandler.logFilePath())
                }
              },
            },
          ],
        },
      ],
    },
    getHelpMenu(isMac),
  ]
}

function getMenuItem(menu: Menu, label: string) {
  for (let i = 0; i < menu.items.length; i++) {
    const menuItem = menu.items[i].submenu?.items.find(function (item) {
      return item.label === label
    })
    if (menuItem) return menuItem
  }
}
