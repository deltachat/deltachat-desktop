const appConfig = require('application-config')('DeltaChat')
const path = require('path')
const { EventEmitter } = require('events')

const config = require('../../config')
const log = require('../../logger').getLogger('renderer/state')

const SAVE_DEBOUNCE_INTERVAL = 1000

appConfig.filePath = path.join(config.CONFIG_PATH, 'config.json')

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
    /*
     * Temporary state disappears once the program exits.
     * It can contain complex objects like open connections, etc.
     */
    window: {
      bounds: null, /* {x, y, width, height } */
      isFocused: true,
      isFullScreen: false
    },
    modal: null, /* modal popover */
    errors: [], /* user-facing errors */
    deltachat: {
      chats: [],
      credentials: {},
      ready: false
    },

    /*
     * Saved state is read from and written to a file every time the app runs.
     * It should be simple and minimal and must be JSON.
     * It must never contain absolute paths since we have a portable app.
     *
     * Config path:
     *
     * Mac                  ~/Library/Application Support/DeltaChat/config.json
     * Linux (XDG)          $XDG_CONFIG_HOME/DeltaChat/config.json
     * Linux (Legacy)       ~/.config/DeltaChat/config.json
     * Windows (> Vista)    %LOCALAPPDATA%/DeltaChat/config.json
     * Windows (XP, 2000)   %USERPROFILE%/Local Settings/Application Data/DeltaChat/config.json
     *
     * Also accessible via `require('application-config')('DeltaChat').filePath`
     */
    saved: {
      markRead: true,
      notifications: true,
      showNotificationContent: true,
      locale: 'en'
    }
  }
}

function load (cb) {
  appConfig.read(function (err, saved) {
    if (err) {
      log.info('Missing configuration file. Using default values.')
    }
    const state = getDefaultState()
    state.saved = Object.assign(state.saved, err ? {} : saved)
    cb(null, state)
  })
}

// Write state.saved to the JSON state file
function saveImmediate (state, cb) {
  log.info('Saving state to ' + appConfig.filePath)

  // Clean up, so that we're not saving any pending state
  const copy = Object.assign({}, state.saved)

  appConfig.write(copy, (err) => {
    if (err) {
      log.error('State save failed', err)
    } else State.emit('stateSaved')
  })
}
