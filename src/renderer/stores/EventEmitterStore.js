import { Store } from './store'

export default class EventEmitterStore extends Store {
  constructor(state) {
    super(state)
    this.hooks = []
    this.eventListeners = {}
  }

  dispatch(action) {
    super.dispatch(action)
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
}
