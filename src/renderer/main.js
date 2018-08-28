const React = require('react')
const ReactDOM = require('react-dom')

const {ipcRenderer} = require('electron')
const State = require('./lib/state')
const localize = require('../localize')
const App = require('./app')

State.load(onState)

let app
let state

function onState (err, _state) {
  if (err) console.error(err)
  state = window.state = _state

  setupLocaleData(state.saved.locale)
  app = ReactDOM.render(<App state={state} />, document.querySelector('#root'))

  setupIpc()
}

function setupIpc () {
  ipcRenderer.on('log', (e, ...args) => console.log(...args))
  ipcRenderer.on('error', (e, ...args) => console.error(...args))
  ipcRenderer.on('stateSave', (e) => State.save(state))
  ipcRenderer.on('chooseLanguage', onChooseLanguage)
  ipcRenderer.on('windowBoundsChanged', onWindowBoundsChanged)

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
  updateElectron()
}

function updateElectron () {
  if (state.window.title !== state.prev.title) {
    state.prev.title = state.window.title
    ipcRenderer.send('setTitle', state.window.title)
  }
}
