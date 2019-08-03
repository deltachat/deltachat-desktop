// eslint-disable-next-line
window.eval = global.eval = function () {
  throw new Error(`Sorry, this app does not support window.eval().`)
}

const React = require('react')
const ReactDOM = require('react-dom')

const { remote, ipcRenderer } = require('electron')
const logger = require('../logger')
logger.setLogHandler((...args) => ipcRenderer.send('handleLogMessage', ...args))
const log = logger.getLogger('render/main')
const localize = require('../localize')
const moment = require('moment')
const App = require('./App')

const STATE_WRAPPER = {}
const state = STATE_WRAPPER.state = remote.app.state

setupLocaleData(state.saved.locale)

const app = ReactDOM.render(
  <App STATE_WRAPPER={STATE_WRAPPER} />,
  document.querySelector('#root')
)
ipcRenderer.on('ALL', (e, eName, ...args) => log.debug('ipcRenderer', eName, ...args))
ipcRenderer.on('error', (e, ...args) => console.error(...args))

ipcRenderer.on('chooseLanguage', onChooseLanguage)

ipcRenderer.on('render', (e, state) => {
  STATE_WRAPPER.state = state
  app.setState(state)
})

ipcRenderer.send('ipcReady')

function onChooseLanguage (e, locale) {
  setupLocaleData(locale)
  app.forceUpdate()
  ipcRenderer.send('chooseLanguage', locale)
}

function setupLocaleData (locale) {
  moment.locale(locale)
  window.localeData = ipcRenderer.sendSync('locale-data', locale)
  window.translate = localize.translate(window.localeData.messages)
}

window.addEventListener('keydown', function (ev) {
  if (ev.code === 'KeyA' && (ev.metaKey || ev.ctrlKey)) {
    let stop = true
    if (ev.target.localName === 'textarea' || ev.target.localName === 'input') {
      stop = false
    } else {
      for (let index = 0; index < ev.path.length; index++) {
        const element = ev.path[index]
        if (element.localName === 'textarea' || element.localName === 'input') stop = false
      }
    }
    if (stop) {
      ev.stopPropagation()
      ev.preventDefault()
    }
  }
})
