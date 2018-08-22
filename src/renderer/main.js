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

  State.on('stateSaved', () => ipcRenderer.send('stateSaved'))

  app = ReactDOM.render(<App state={state} />, document.querySelector('#root'))

  setupIpc()

  // setInterval(update, 1000)
}

const dispatchHandlers = {
  'stateSave': () => State.save(state)
}

// Events from the UI never modify state directly. Instead they call dispatch()
function dispatch (action, ...args) {
  // Log dispatch calls, for debugging
  console.log('dispatch: %s %o', action, args)

  const handler = dispatchHandlers[action]
  if (handler) handler(...args)
  else console.error('Missing dispatch handler: ' + action)

  // Update the virtual DOM
  update()
}

function setupIpc () {
  ipcRenderer.on('error', (e, ...args) => console.error(...args))
  ipcRenderer.on('dispatch', (e, ...args) => dispatch(...args))
  ipcRenderer.on('windowBoundsChanged', onWindowBoundsChanged)
}

function onWindowBoundsChanged (e, newBounds) {
  state.saved.bounds = newBounds
  dispatch('stateSave')
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
