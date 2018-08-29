module.exports = {
  init
}

const electron = require('electron')
const fs = require('fs')

const app = electron.app

const localize = require('../localize')
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
  ipc.on('chooseLanguage', (e, locale) => {
    localize.setup(app, locale)
    menu.chooseLanguage(locale)
  })

  // Called once to get the conversations css string
  ipc.on('get-css', (e) => {
    var p = require.resolve('conversations/build/manifest.css')
    e.returnValue = fs.readFileSync(p).toString()
  })

  // Our wrapper for controlling deltachat instances
  const dc = new DeltaChat()

  // Create a new instance
  ipc.on('init', (e, ...args) => {
    dc.init(...args, render)
  })

  // Calls a function directly in the deltachat-node instance and returns the
  // value (sync)
  ipc.on('dispatchSync', (e, ...args) => {
    e.returnValue = dispatch(...args)
    render()
  })

  // Calls the function without returning the value (async)
  ipc.on('dispatch', (e, ...args) => {
    dispatch(...args)
    render()
  })

  // This needs to be JSON serializable for rendering to the frontend.
  ipc.on('render', render)
  ipc.on('locale-data', (e, locale) => {
    if (locale) app.localeData = localize.setup(app, locale)
    e.returnValue = app.localeData
  })

  function dispatch (name, ...args) {
    var handler = dc[name]
    if (!handler) throw new Error(`fn with name ${name} does not exist`)
    return handler.call(dc, ...args)
  }

  function render () {
    windows.main.send('render', dc.render())
  }
}
