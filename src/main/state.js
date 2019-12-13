const appConfig = require('../application-config')
const { EventEmitter } = require('events')
const log = require('../logger').getLogger('main/state')
const { promisify } = require('util')

const SAVE_DEBOUNCE_INTERVAL = 1000

const State = module.exports = Object.assign(new EventEmitter(), {
  load,
  // state.save() calls are rate-limited. Use state.saveImmediate() to skip limit.
  save: function () {
    // Perf optimization: Lazy-require debounce (and it's dependencies)
    const debounce = require('debounce')
    // After first State.save() invokation, future calls go straight to the
    // debounced function
    State.save = debounce(saveImmediate, SAVE_DEBOUNCE_INTERVAL)
    State.save(...arguments)
  },
  saveImmediate
})

function getDefaultState () {
  return {
    /**
     * Temporary state.
     */
    logins: [],
    deltachat: {
      chats: [],
      credentials: {},
      ready: false
    },
    /**
     * Persisted state. Must be JSON.
     */
    saved: {
      enterKeySends: false,
      notifications: true,
      showNotificationContent: true,
      locale: 'en',
      credentials: null,
      enableOnDemandLocationStreaming: false,
      chatViewBgImgPath: undefined
    }
  }
}

async function load () {
  var state = getDefaultState()
  var saved = {}
  try {
    saved = await promisify(cb => appConfig.read(cb))()
  } catch (error) {
    log.debug(error)
    log.info('Missing configuration file. Using default values.')
  }
  state.saved = Object.assign(state.saved, saved)
  return state
}

function saveImmediate (state, cb) {
  log.info(`Saving state to ${appConfig.filePath}`)
  const copy = Object.assign({}, state.saved)
  appConfig.write(copy, err => {
    if (err) {
      log.error('State save failed', err)
    }
    cb && cb(err)
  })
}
