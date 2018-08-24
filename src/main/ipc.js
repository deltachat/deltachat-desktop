module.exports = {
  init
}

const electron = require('electron')

const app = electron.app

const menu = require('./menu')
const windows = require('./windows')

const DeltaChat = require('./deltachat')

function init () {
  // Events dispatched by buttons from the frontend

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
  ipc.on('init', (e, ...args) => {
    dc.init(...args, function () {
      render()
    })
  })

  // Calls a function directly in the deltachat-node instance and returns the
  // value (sync)
  ipc.on('dispatchSync', (e, ...args) => {
    e.returnValue = dc.dispatch(...args)
  })

  // Calls the function without returning the value (async)
  ipc.on('dispatch', (e, ...args) => dc.dispatch(...args))

  // This needs to be JSON serializable for rendering to the frontend.
  ipc.on('render', render)

  ipc.on('createChatByContactId', (e, ...args) => {
    e.returnValue = dc.createChatByContactId(...args)
  })

  function render () {
    windows.main.send('render', dc.render())
  }
}
