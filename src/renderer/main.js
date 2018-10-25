// eslint-disable-next-line
window.eval = global.eval = function () {
  throw new Error(`Sorry, this app does not support window.eval().`)
}

const React = require('react')
const ReactDOM = require('react-dom')

const insertCss = require('insert-css')

const { ipcRenderer } = require('electron')
const State = require('./lib/state')
const localize = require('../localize')
const App = require('./App')

State.load(onState)

let app
let state

function onState (err, _state) {
  if (err) console.error(err)
  state = window.state = _state

  setupLocaleData(state.saved.locale)

  const conversationsCss = ipcRenderer.sendSync('get-css')
  insertCss(conversationsCss, { prepend: true })

  app = ReactDOM.render(<App state={state} />, document.querySelector('#root'))

  setupIpc()
}

function setupIpc () {
  ipcRenderer.on('log', (e, ...args) => console.log(...args))
  ipcRenderer.on('error', (e, ...args) => console.error(...args))
  ipcRenderer.on('stateSave', (e) => State.save(state))
  ipcRenderer.on('stateSaveImmediate', (e) => State.saveImmediate(state))

  ipcRenderer.on('chooseLanguage', onChooseLanguage)
  ipcRenderer.on('windowBoundsChanged', onWindowBoundsChanged)

  ipcRenderer.on('uncaughtError', (e, ...args) => {
    console.log('uncaughtError in', ...args)
  })

  ipcRenderer.on('render', (e, deltachat) => {
    update(deltachat)
  })

  ipcRenderer.send('ipcReady')

  State.on('stateSaved', () => ipcRenderer.send('stateSaved'))
}

function setupLocaleData (locale) {
  // if no locale provided, uses app.getLocale() under the hood.
  window.localeData = ipcRenderer.sendSync('locale-data', locale)
  window.translate = localize.translate(window.localeData.messages)
}

function onChooseLanguage (e, locale) {
  setupLocaleData(locale)
  state.saved.locale = locale
  State.save(state)
  app.forceUpdate()
  ipcRenderer.send('chooseLanguage', locale) // update menu language
}

function onWindowBoundsChanged (e, newBounds) {
  state.saved.bounds = newBounds
  State.save(state)
}

function update (deltachat) {
  state.deltachat = deltachat
  app.setState(state)
}
