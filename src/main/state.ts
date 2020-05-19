import { EventEmitter } from 'events'
import { promisify } from 'util'
import { getLogger } from '../shared/logger'
import { AppState } from '../shared/shared-types'
import { getDefaultState } from '../shared/state'
import appConfig from './application-config'
import debounce from 'debounce'
const log = getLogger('main/state')

const SAVE_DEBOUNCE_INTERVAL = 1000

const State = Object.assign(new EventEmitter(), {
  load,
  // state.save() calls are rate-limited. Use state.saveImmediate() to skip limit.
  save: function(state: Partial<AppState>, cb?: (err: any) => void) {
    // After first State.save() invokation, future calls go straight to the
    // debounced function
    State.save = debounce(saveImmediate, SAVE_DEBOUNCE_INTERVAL)
    saveImmediate(state, cb)
  },
  saveImmediate,
})

export default State

async function load() {
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

function saveImmediate(state: Partial<AppState>, cb?: (err: any) => void) {
  log.info(`Saving state to ${appConfig.filePath}`)
  const copy = Object.assign({}, state.saved)
  appConfig.write(copy, (err: any) => {
    if (err) {
      log.error('State save failed', err)
    }
    cb && cb(err)
  })
}
