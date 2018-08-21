const path = require('path')
const DeltaChat = require('deltachat-node')

module.exports = {
  init
}

const electron = require('electron')

const app = electron.app

const menu = require('./menu')
const windows = require('./windows')
const config = require('../config')

let dc

function init () {
  const ipc = electron.ipcMain

  ipc.once('ipcReady', function (e) {
    app.ipcReady = true
    app.emit('ipcReady')
  })

  const main = windows.main

  ipc.on('setAspectRatio', (e, ...args) => main.setAspectRatio(...args))
  ipc.on('setBounds', (e, ...args) => main.setBounds(...args))
  ipc.on('setProgress', (e, ...args) => main.setProgress(...args))
  ipc.on('setTitle', (e, ...args) => main.setTitle(...args))
  ipc.on('show', () => main.show())
  ipc.on('setAllowNav', (e, ...args) => menu.setAllowNav(...args))

  /** DELTACHAT **/
  ipc.on('login', function (e, credentials) {
    dc = new DeltaChat({
      addr: credentials.email,
      mail_pw: credentials.password,
      cwd: path.join(config.CONFIG_PATH, 'db') // where to store?
    })
  })
}
