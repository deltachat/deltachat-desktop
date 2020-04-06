import { app, Menu, shell } from 'electron'
import {
  gitHubIssuesUrl,
  gitHubUrl,
  homePageUrl,
  appWindowTitle,
} from '../shared/constants'
import { getLogger } from '../shared/logger'
import { getLogsPath } from './application-constants'
import { LogHandler } from './log-handler'
import { ExtendedAppMainProcess } from './types'
import * as mainWindow from './windows/main'

const log = getLogger('main/menu')

const languages: {
  locale: string
  name: string
}[] = require('../../_locales/_languages.json')

export function init(logHandler: LogHandler) {
  log.info(
    `rebuilding menu with locale ${
      (app as ExtendedAppMainProcess).localeData.locale
    }`
  )
  const template = getMenuTemplate(logHandler)
  const menu = Menu.buildFromTemplate(setLabels(template))
  const item = getMenuItem(
    menu,
    (app as ExtendedAppMainProcess).translate(
      'global_menu_view_floatontop_desktop'
    )
  )
  if (item) item.checked = mainWindow.isAlwaysOnTop()
  Menu.setApplicationMenu(menu)
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
  const translate = (app as ExtendedAppMainProcess).translate

  doTranslation(menu)

  function doTranslation(menu: rawMenuItem[]) {
    menu.forEach(item => {
      if (item.translate) {
        item.label = translate(item.translate)
      }
      if (item.submenu) doTranslation(item.submenu as any)
    })
  }

  return menu
}

function getAvailableLanguages(): Electron.MenuItemConstructorOptions[] {
  return languages
    .filter(({ name }) => name.indexOf('*') === -1)
    .sort(({ name: name1 }, { name: name2 }) => (name1 > name2 ? 1 : -1))
    .map(({ locale, name }) => {
      return {
        label: name,
        type: 'radio',
        checked: locale === (app as ExtendedAppMainProcess).localeData.locale,
        click: () => {
          ;(app as ExtendedAppMainProcess).state.saved.locale = locale
          ;(app as ExtendedAppMainProcess).saveState()
          mainWindow.chooseLanguage(locale)
        },
      }
    })
}

function getZoomFactors(): Electron.MenuItemConstructorOptions[] {
  // for now this solution is electron specific
  const zoomFactors = [
    { scale: 0.6, key: 'micro' },
    { scale: 0.8, key: 'small' },
    { scale: 1.0, key: 'default' },
    { scale: 1.2, key: 'large' },
    { scale: 1.4, key: 'huge' },
  ]

  if (
    zoomFactors
      .map(({ scale }) => scale)
      .indexOf((app as ExtendedAppMainProcess).state.saved.zoomFactor) === -1
  )
    zoomFactors.push({
      scale: (app as ExtendedAppMainProcess).state.saved.zoomFactor,
      key: 'custom',
    })

  return zoomFactors.map(({ key, scale }) => {
    return {
      label: !(scale === 1 && key === 'custom')
        ? `${scale}x ${(app as ExtendedAppMainProcess).translate(
            'global_zoom_factor_' + key
          )}`
        : (app as ExtendedAppMainProcess).translate(
            'global_zoom_factor_custom'
          ),
      type: 'radio',
      checked:
        scale === (app as ExtendedAppMainProcess).state.saved.zoomFactor &&
        !(scale === 1 && key === 'custom'),
      click: () => {
        if (key !== 'custom') {
          ;(app as ExtendedAppMainProcess).state.saved.zoomFactor = scale
          mainWindow.setZoomFactor(scale)
          ;(app as ExtendedAppMainProcess).saveState()
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
          role: 'about',
          click: () => {
            mainWindow.send('showAboutDialog')
          },
        },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideOthers' },
        { role: 'unhide' },
        { type: 'separator' },
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
          translate: 'global_menu_view_zoom_factor',
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
              click: () => shell.openItem(getLogsPath()),
            },
            {
              translate: 'menu.view.developer.open.current.log.file',
              click: () => shell.openItem(logHandler.logFilePath()),
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
    const menuItem = menu.items[i].submenu.items.find(function(item) {
      return item.label === label
    })
    if (menuItem) return menuItem
  }
}
