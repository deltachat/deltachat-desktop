import logger from '../../logger'

const log = logger.getLogger('renderer/stores/store')

class Store {
  constructor (state) {
    this.state = state
    this.listeners = []
    this.reducers = []
    this.effects = []
    this.hooks = []
    this.eventListeners = {}
  }

  getState () {
    return this.state
  }

  dispatch (action) {
    log.debug('DISPATCH:', action)
    let state = Object.assign({}, this.state)
    this.reducers.forEach(reducer => {
      state = reducer(action, state)
    })
    this.effects.forEach(effect => {
      effect(action, state)
    })
    this.state = state
    this.listeners.forEach(listener => listener(this.state))
    this.hooks.forEach(hook => hook(action))
  }

  addListener(eventName, cb) {
    if (typeof this.eventListeners[eventName] === 'undefined') {
      this.eventListeners[eventName] = [cb]
    } else {
      this.eventListeners[eventName].push(cb)
    }
  }

  removeListener(eventName, cb) {
    let eventListeners = this.eventListeners[eventName]
    if(!eventListeners) return
    eventListeners.splice (eventListeners.indexOf(cb), 1);
  }

  emit(eventName, payload) {
    let eventListeners = this.eventListeners[eventName]
    if(!eventListeners) return
    eventListeners.forEach(eventListener => eventListener(payload))
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
