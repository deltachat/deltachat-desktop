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

  // setInterval(update, 1000)
}

function setupIpc () {
  ipcRenderer.on('error', (e, ...args) => console.error(...args))
}

function update () {
  app.setState(state)
  updateElectron()
}

function updateElectron () {
  if (state.window.title !== state.prev.title) {
    state.prev.title = state.window.title
    ipcRenderer.send('setTitle', state.window.title)
  }
}
