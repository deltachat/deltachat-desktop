import { EventEmitter } from 'events'
import { promisify } from 'util'
import { getLogger } from '../shared/logger'
import { DesktopSettingsType } from '../shared/shared-types'
import { getDefaultState } from '../shared/state'
import appConfig from './application-config'
import debounce from 'debounce'
const log = getLogger('main/state')

const SAVE_DEBOUNCE_INTERVAL = 1000

class PersistentState extends EventEmitter {
  constructor() {
    super()
  }

  private inner_state: null | DesktopSettingsType = null

  get state(): Readonly<DesktopSettingsType> {
    if (this.inner_state == null) {
      throw new Error('Can not access persistent state before initialisation')
    }
    return this.inner_state
  }

  async load() {
    const default_state = getDefaultState()
    let saved: Partial<DesktopSettingsType> = {}
    try {
      saved = (await promisify(cb =>
        appConfig.read(cb)
      )()) as DesktopSettingsType
      // validate&fix saved state
      if (typeof saved.lastAccount !== 'number') {
        saved.lastAccount = undefined
      }
    } catch (error) {
      log.debug(error)
      log.info('Missing configuration file. Using default values.')
    }
    this.inner_state = Object.assign(default_state, saved)
  }

  update(state: Partial<DesktopSettingsType>) {
    this.inner_state = { ...this.inner_state, ...state } as DesktopSettingsType
    this.save()
  }

  /** state.save() calls are rate-limited. Use `PersistentState.saveImmediate()` to skip limit. */
  save() {
    // After first State.save() invocation, future calls go straight to the
    // debounced function
    this.save = debounce(this.saveImmediate, SAVE_DEBOUNCE_INTERVAL)
    this.saveImmediate()
  }

  saveImmediate(): Promise<void> {
    log.info(`Saving state to ${appConfig.filePath}`)
    const copy = Object.assign({}, this.inner_state)
    return new Promise((res, rej) => {
      appConfig.write(copy, (err: any) => {
        if (err) {
          log.error('State save failed', err)
          rej(err)
        }
        res(err)
      })
    })
  }
}

// State singleton
export const DesktopSettings = new PersistentState()
