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
      translate: 'menu.edit',
      submenu: [
        {
          translate: 'menu.edit.undo',
          role: 'undo'
        },
        {
          translate: 'menu.edit.redo',
          role: 'redo'
        },
        {
          type: 'separator'
        },
        {
          translate: 'menu.edit.cut',
          role: 'cut'
        },
        {
          translate: 'menu.edit.copy',
          role: 'copy'
        },
        {
          translate: 'menu.edit.paste',
          role: 'paste'
        },
        {
          translate: 'menu.edit.delete',
          role: 'delete'
        },
        {
          translate: 'menu.edit.selectall',
          role: 'selectall'
        }
      ]
    },
    {
      translate: 'menu.view',
      submenu: [
        {
          translate: 'menu.view.floatontop',
          type: 'checkbox',
          click: () => windows.main.toggleAlwaysOnTop()
        },
        {
          type: 'separator'
        },
        {
          translate: 'menu.view.developer',
          submenu: [
            {
              translate: 'menu.view.developer.tools',
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
      translate: 'menu.preferences',
      submenu: [
        {
          translate: 'menu.preferences.language',
          submenu: getAvailableLanguages()
        }
      ]
    },
    {
      translate: 'menu.help',
      role: 'help',
      submenu: [
        {
          translate: 'menu.help.learn',
          click: () => {
            electron.shell.openExternal(config.HOME_PAGE_URL)
          }
        },
        {
          translate: 'menu.help.contribute',
          click: () => {
            electron.shell.openExternal(config.GITHUB_URL)
          }
        },
        {
          type: 'separator'
        },
        {
          translate: 'menu.help.report',
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
