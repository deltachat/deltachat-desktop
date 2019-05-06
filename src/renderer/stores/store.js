
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
    let state = Object.assign({}, this.state)
    this.reducers.forEach(reducer => {
      state = reducer(action, state)
    })
    this.effects.forEach(effect => {
      effect(action, state)
    })
    this.state = state
    this.listeners.forEach(listener => listener(this.state))
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
