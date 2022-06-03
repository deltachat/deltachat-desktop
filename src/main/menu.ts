import { Menu, shell } from 'electron'
import {
  gitHubIssuesUrl,
  gitHubUrl,
  homePageUrl,
  appWindowTitle,
} from '../shared/constants'
import { getLogger } from '../shared/logger'
import { getConfigPath, getLogsPath } from './application-constants'
import { LogHandler } from './log-handler'
import * as mainWindow from './windows/main'
import { readFileSync } from 'fs'
import { basename, join } from 'path'
import { DesktopSettings } from './desktop_settings'
import { getCurrentLocaleDate, tx } from './load-translations'
import { appx, getAppxPath } from './isAppx'

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
  const menu = Menu.buildFromTemplate(setLabels(template))
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

function setLabels(menu: rawMenuItem[]): Electron.MenuItemConstructorOptions[] {
  // JANKY
  // Electron doesn't allow us to modify the menu with a new template,
  // so we must modify the labels directly in order to change
  // the menu item labels when the user changes languages

  doTranslation(menu)

  function doTranslation(menu: rawMenuItem[]) {
    menu.forEach(item => {
      if (item.translate) {
        item.label = tx(item.translate)
      }
      if (item.submenu) doTranslation(item.submenu as any)
    })
  }

  return menu
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

function getMenuTemplate(logHandler: LogHandler): rawMenuItem[] {
  const isMac = process.platform === 'darwin'
  const AppMenu: rawMenuItem[] = [
    {
      label: appWindowTitle,
      submenu: [
        {
          translate: 'global_menu_help_about_desktop',
          click: () => {
            mainWindow.send('showAboutDialog')
          },
        },
        { type: 'separator' },
        {
          translate: 'menu_settings',
          click: () => {
            mainWindow.send('showSettingsDialog')
          },
          accelerator: 'Cmd+,',
        },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideOthers' },
        { role: 'unhide' },
        { type: 'separator' },
        {
          // because menubar stays when it's closed and apple wants that the user can reopen it via the menu bar
          translate: 'show_window',
          click: () => {
            mainWindow.show()
          },
        },
        { translate: 'global_menu_file_quit_desktop', role: 'quit' },
      ],
    },
  ]
  return [
    ...(isMac ? AppMenu : []),
    ...(!isMac
      ? <rawMenuItem[]>[
          {
            translate: 'global_menu_file_desktop',
            submenu: [
              {
                translate: 'menu_settings',
                click: () => {
                  mainWindow.send('showSettingsDialog')
                },
                accelerator: 'Ctrl+,',
              },
              {
                translate: 'global_menu_file_quit_desktop',
                role: 'quit',
              },
            ],
          },
        ]
      : []),
    {
      translate: 'global_menu_edit_desktop',
      submenu: [
        {
          translate: 'global_menu_edit_undo_desktop',
          role: 'undo',
        },
        {
          translate: 'global_menu_edit_redo_desktop',
          role: 'redo',
        },
        {
          type: 'separator',
        },
        {
          translate: 'global_menu_edit_cut_desktop',
          role: 'cut',
        },
        {
          translate: 'global_menu_edit_copy_desktop',
          role: 'copy',
        },
        {
          translate: 'global_menu_edit_paste_desktop',
          role: 'paste',
        },
        {
          translate: 'delete',
          role: 'delete',
        },
        {
          translate: 'menu_select_all',
          role: 'selectAll',
        },
      ],
    },
    {
      translate: 'global_menu_view_desktop',
      submenu: [
        {
          translate: 'global_menu_view_floatontop_desktop',
          type: 'checkbox',
          click: () => mainWindow.toggleAlwaysOnTop(),
        },
        {
          translate: 'zoom',
          submenu: getZoomFactors(),
        },
        {
          translate: 'pref_language',
          submenu: getAvailableLanguages(),
        },
        {
          type: 'separator',
        },
        {
          translate: 'global_menu_view_developer_desktop',
          submenu: [
            {
              translate: 'global_menu_view_developer_tools_desktop',
              accelerator:
                process.platform === 'darwin'
                  ? 'Alt+Command+I'
                  : 'Ctrl+Shift+I',
              click: () => mainWindow.toggleDevTools(),
            },
            {
              translate: 'menu.view.developer.open.log.folder',
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
              translate: 'menu.view.developer.open.current.log.file',
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
    {
      translate: 'global_menu_help_desktop',
      role: 'help',
      submenu: [
        {
          translate: 'menu_help',
          click: () => {
            mainWindow.send('showHelpDialog')
          },
          accelerator: 'F1',
        },
        {
          translate: 'keybindings',
          click: () => {
            mainWindow.send('showKeybindingsDialog')
          },
          accelerator: isMac ? 'Cmd+/' : 'Ctrl+/',
        },
        {
          translate: 'global_menu_help_learn_desktop',
          click: () => {
            shell.openExternal(homePageUrl)
          },
        },
        {
          translate: 'global_menu_help_contribute_desktop',
          click: () => {
            shell.openExternal(gitHubUrl)
          },
        },
        {
          type: 'separator',
        },
        {
          translate: 'global_menu_help_report_desktop',
          click: () => {
            shell.openExternal(gitHubIssuesUrl)
          },
        },
        {
          translate: 'global_menu_help_about_desktop',
          click: () => {
            mainWindow.send('showAboutDialog')
          },
        },
      ],
    },
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
