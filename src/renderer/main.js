const React = require('react')
const ReactDOM = require('react-dom')

const {ipcRenderer} = require('electron')
const config = require('../config')
const State = require('./lib/state')
const App = require('./app')

State.load(onState)

let app
let state

function onState (err, _state) {
  state = window.state = _state

  // Add first page to location history
  state.location.go({
    url: 'home',
    setup: (cb) => {
      state.window.title = config.APP_WINDOW_TITLE
      cb(null)
    }
  })

  app = ReactDOM.render(<App state={state} />, document.querySelector('#root'))

  setupIpc()
}

function setupIpc () {
  ipcRenderer.on('log', (e, ...args) => console.log(...args))
  ipcRenderer.on('error', (e, ...args) => console.error(...args))
  ipcRenderer.on('stateSave', (e) => State.save(state))

  ipcRenderer.on('windowBoundsChanged', onWindowBoundsChanged)

  ipcRenderer.on('render', (e, deltachat) => {
    update(deltachat)
  })

  ipcRenderer.send('ipcReady')

  State.on('stateSaved', () => ipcRenderer.send('stateSaved'))
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
