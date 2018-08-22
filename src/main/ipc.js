module.exports = {
  init
}

const electron = require('electron')

const app = electron.app

const menu = require('./menu')
const windows = require('./windows')

const DeltaChat = require('./deltachat')

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

  // Our wrapper for controlling deltachat instances
  const dc = new DeltaChat()

  // Create a new instance
  ipc.on('init', (e, ...args) => dc.init(...args))
}
