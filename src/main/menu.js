module.exports = {
  init
}

const electron = require('electron')
const fs = require('fs')
const path = require('path')
const log = require('./log')
const windows = require('./windows')
const config = require('../config')

const app = electron.app

function init () {
  log('rebuilding menu with language', app.localeData.locale)
  const template = getMenuTemplate()
  const menu = electron.Menu.buildFromTemplate(setLabels(template))
  const item = getMenuItem(menu, app.translate('menu.view.floatontop'))
  if (item) item.checked = windows.main.isAlwaysOnTop()
  electron.Menu.setApplicationMenu(menu)
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
  var locales = fs.readdirSync(path.join(__dirname, '..', '..', '_locales'))
  locales = locales.filter((locale) => !locale.startsWith('_'))
  return locales.map((l) => {
    var locale = l.split('.json')[0]
    return {
      label: app.translate(`language_${locale}`),
      type: 'radio',
      checked: locale === app.localeData.locale,
      click: () => windows.main.chooseLanguage(locale)
    }
  })
}

function getMenuTemplate () {
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
          translate: 'global_menu_edit_delete_desktop',
          role: 'delete'
        },
        {
          translate: 'global_menu_edit_selectall_desktop',
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
            }
          ]
        }
      ]
    },
    {
      translate: 'global_menu_preferences_desktop',
      submenu: [
        {
          translate: 'global_menu_preferences_language_desktop',
          submenu: getAvailableLanguages()
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
            electron.shell.openExternal(config.HOME_PAGE_URL)
          }
        },
        {
          translate: 'global_menu_help_contribute_desktop',
          click: () => {
            electron.shell.openExternal(config.GITHUB_URL)
          }
        },
        {
          type: 'separator'
        },
        {
          translate: 'global_menu_help_report_desktop',
          click: () => {
            electron.shell.openExternal(config.GITHUB_URL_ISSUES)
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
    console.log( menu.items[i])
    const menuItem = menu.items[i].submenu.items.find(function (item) {
      return item.label === label
    })
    if (menuItem) return menuItem
  }
}
