module.exports = {
  init,
  setWindowFocus,
  onToggleAlwaysOnTop
}

const electron = require('electron')

let menu = null

const windows = require('./windows')
const config = require('../config')

function init () {
  menu = electron.Menu.buildFromTemplate(getMenuTemplate())
  electron.Menu.setApplicationMenu(menu)
}


function onToggleAlwaysOnTop (flag) {
  getMenuItem('Float on Top').checked = flag
}


function setWindowFocus (flag) {
  getMenuItem('Float on Top').enabled = flag
}

function getMenuTemplate () {
  const template = [
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
            const shell = require('./shell')
            shell.openExternal(config.HOME_PAGE_URL)
          }
        },
        {
          label: 'Contribute on GitHub',
          click: () => {
            const shell = require('./shell')
            shell.openExternal(config.GITHUB_URL)
          }
        },
        {
          type: 'separator'
        },
        {
          label: 'Report an Issue...',
          click: () => {
            const shell = require('./shell')
            shell.openExternal(config.GITHUB_URL_ISSUES)
          }
        }
      ]
    }
  ]
  return template
}

function getMenuItem (label) {
  for (let i = 0; i < menu.items.length; i++) {
    const menuItem = menu.items[i].submenu.items.find(function (item) {
      return item.label === label
    })
    if (menuItem) return menuItem
  }
}
