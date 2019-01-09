// eslint-disable-next-line
window.eval = global.eval = function () {
  throw new Error(`Sorry, this app does not support window.eval().`)
}

const React = require('react')
const ReactDOM = require('react-dom')

const { ipcRenderer } = require('electron')
const State = require('./lib/state')
const localize = require('../localize')
const App = require('./App')
const log = require('../logger').getLogger('renderer/main')

const LoggerVariants = [console.debug, console.info, console.warn, console.error, console.error]

State.load(onState)

let app
let state

function onState (err, _state) {
  if (err) log.error('onState', err)
  state = window.state = _state

  setupLocaleData(state.saved.locale)

  app = ReactDOM.render(<App state={state} />, document.querySelector('#root'))

  setupIpc()
}

function setupIpc () {
  ipcRenderer.on('log', (e, channel, lvl, ...args) => {
    const variant = LoggerVariants[lvl]
    variant(channel, ...args)
  })
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

  require('../logger').setLogHandler((...args) => { ipcRenderer.send('handleLogMessage', ...args) })
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
