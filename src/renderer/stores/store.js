import logger from '../../logger'

const log = logger.getLogger('renderer/stores/store')

class Store {
  constructor (state) {
    this.state = state
    this.listeners = []
    this.reducers = []
    this.effects = []
  }

  getState () {
    return this.state
  }

  dispatch (action) {
    log.debug('DISPATCH:', action)
    let state = this.state
    this.reducers.forEach(reducer => {
      state = reducer(action, state)
    })
    this.effects.forEach(effect => {
      effect(action, state)
    })
    if (state != this.state) {
      this.state = state
      this.listeners.forEach(listener => listener(this.state))
    }
  }


  subscribe (listener) {
    this.listeners.push(listener)
    return this.unsubscribe.bind(this, listener)
  }

  unsubscribe (listener) {
    const index = this.listeners.indexOf(listener)
    this.listeners.splice(index, 1)
  }

  setState (state) {
    this.state = state
    this.listeners.forEach(listener => listener(this.state))
  }
}

export { Store }
