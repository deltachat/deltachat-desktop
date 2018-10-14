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
  getMenuItem(menu, 'Float on Top').checked = windows.main.isAlwaysOnTop()
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
  return locales.map((l) => {
    var locale = l.split('.json')[0]
    return {
      label: app.translate(`language.${locale}`),
      type: 'radio',
      checked: locale === app.localeData.locale,
      click: () => windows.main.chooseLanguage(locale)
    }
  })
}

function getMenuTemplate () {
  return [
    {
      translate: 'menu.preferences',
      submenu: [
        {
          translate: 'menu.preferences.language',
          submenu: getAvailableLanguages()
        }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        {
          role: 'undo'
        },
        {
          role: 'redo'
        },
        {
          type: 'separator'
        },
        {
          role: 'cut'
        },
        {
          role: 'copy'
        },
        {
          role: 'delete'
        },
        {
          role: 'selectall'
        }
      ]
    },
    {
      label: 'View',
      submenu: [
        {
          label: 'Float on Top',
          type: 'checkbox',
          click: () => windows.main.toggleAlwaysOnTop()
        },
        {
          type: 'separator'
        },
        {
          label: 'Go Back',
          accelerator: 'Esc',
          click: () => windows.main.dispatch('escapeBack')
        },
        {
          type: 'separator'
        },
        {
          label: 'Developer',
          submenu: [
            {
              label: 'Developer Tools',
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
      label: 'Help',
      role: 'help',
      submenu: [
        {
          label: 'Learn more about ' + config.APP_NAME,
          click: () => {
            electron.shell.openExternal(config.HOME_PAGE_URL)
          }
        },
        {
          label: 'Contribute on GitHub',
          click: () => {
            electron.shell.openExternal(config.GITHUB_URL)
          }
        },
        {
          type: 'separator'
        },
        {
          label: 'Report an Issue...',
          click: () => {
            electron.shell.openExternal(config.GITHUB_URL_ISSUES)
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
