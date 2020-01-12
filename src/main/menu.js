module.exports = { init }

const { app, Menu, shell } = require('electron')
const log = require('../logger').getLogger('main/menu')
const windows = require('./windows')
const {
  homePageUrl,
  gitHubUrl,
  gitHubIssuesUrl,
  getLogsPath
} = require('./application-constants')

const languages = require('../../_locales/_languages.json')

function init (logHandler) {
  log.info(`rebuilding menu with locale ${app.localeData.locale}`)
  const template = getMenuTemplate(logHandler)
  const menu = Menu.buildFromTemplate(setLabels(template))
  const item = getMenuItem(menu, app.translate('global_menu_view_floatontop_desktop'))
  if (item) item.checked = windows.main.isAlwaysOnTop()
  Menu.setApplicationMenu(menu)
}

function setLabels (menu) {
  // JANKY
  // Electron doesn't allow us to modify the menu with a new template,
  // so we must modify the labels directly in order to change
  // the menu item labels when the user changes languages
  const translate = app.translate

  doTranslation(menu)

  function doTranslation (menu) {
    menu.forEach(item => {
      if (item.translate) {
        item.label = translate(item.translate)
      }
      if (item.submenu) doTranslation(item.submenu)
    })
  }

  return menu
}

function getAvailableLanguages () {
  return languages
    .filter(({ name }) => name.indexOf('*') === -1)
    .sort(
      ({ name: name1 }, { name: name2 }) => name1 > name2 ? 1 : -1
    ).map(({ locale, name }) => {
      return {
        label: name,
        type: 'radio',
        checked: locale === app.localeData.locale,
        click: () => {
          app.state.saved.locale = locale
          app.saveState()
          windows.main.chooseLanguage(locale)
        }
      }
    })
}

function getMenuTemplate (logHandler) {
  return [
    {
      translate: 'global_menu_file_desktop',
      submenu: [
        {
          translate: 'global_menu_file_quit_desktop',
          role: 'quit'
        }
      ]
    },
    {
      translate: 'global_menu_edit_desktop',
      submenu: [
        {
          translate: 'global_menu_edit_undo_desktop',
          role: 'undo'
        },
        {
          translate: 'global_menu_edit_redo_desktop',
          role: 'redo'
        },
        {
          type: 'separator'
        },
        {
          translate: 'global_menu_edit_cut_desktop',
          role: 'cut'
        },
        {
          translate: 'global_menu_edit_copy_desktop',
          role: 'copy'
        },
        {
          translate: 'global_menu_edit_paste_desktop',
          role: 'paste'
        },
        {
          translate: 'delete',
          role: 'delete'
        },
        {
          translate: 'menu_select_all',
          role: 'selectall'
        }
      ]
    },
    {
      translate: 'global_menu_view_desktop',
      submenu: [
        {
          translate: 'global_menu_view_floatontop_desktop',
          type: 'checkbox',
          click: () => windows.main.toggleAlwaysOnTop()
        },
        {
          translate: 'global_menu_preferences_language_desktop',
          submenu: getAvailableLanguages()
        },
        {
          type: 'separator'
        },
        {
          translate: 'global_menu_view_developer_desktop',
          submenu: [
            {
              translate: 'global_menu_view_developer_tools_desktop',
              accelerator: process.platform === 'darwin'
                ? 'Alt+Command+I'
                : 'Ctrl+Shift+I',
              click: () => windows.main.toggleDevTools()
            },
            {
              translate: 'menu.view.developer.open.log.folder',
              click: () => shell.openItem(getLogsPath())
            },
            {
              translate: 'menu.view.developer.open.current.log.file',
              click: () => shell.openItem(logHandler.logFilePath())
            }
          ]
        }
      ]
    },
    {
      translate: 'global_menu_help_desktop',
      role: 'help',
      submenu: [
        {
          translate: 'global_menu_help_learn_desktop',
          click: () => {
            shell.openExternal(homePageUrl())
          }
        },
        {
          translate: 'global_menu_help_contribute_desktop',
          click: () => {
            shell.openExternal(gitHubUrl())
          }
        },
        {
          type: 'separator'
        },
        {
          translate: 'global_menu_help_report_desktop',
          click: () => {
            shell.openExternal(gitHubIssuesUrl())
          }
        },
        {
          translate: 'global_menu_help_about_desktop',
          click: () => {
            windows.main.send('showAboutDialog')
          }
        }
      ]
    }
  ]
}

function getMenuItem (menu, label) {
  for (let i = 0; i < menu.items.length; i++) {
    const menuItem = menu.items[i].submenu.items.find(function (item) {
      return item.label === label
    })
    if (menuItem) return menuItem
  }
}
