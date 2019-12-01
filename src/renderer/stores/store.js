import { useState, useEffect } from 'react'
import logger from '../../logger'

export function useStore (StoreInstance) {
  const [state, setState] = useState(StoreInstance.getState())

  useEffect(() => {
    StoreInstance.subscribe(setState)
    return () => StoreInstance.unsubscribe(setState)
  }, [])

  return [state, StoreInstance.dispatch.bind(StoreInstance)]
}

class Store {
  constructor (state, name) {
    this.state = state
    this.listeners = []
    this.reducers = []
    this.effects = []
    if (!name) name = 'Store'
    this.log = logger.getLogger('renderer/stores/' + name)
  }

  getName () {
    return 'Store'
  }

  getState () {
    return this.state
  }

  dispatch (action) {
    this.log.debug('DISPATCH:', action)
    let state = this.state
    this.reducers.forEach(reducer => {
      state = reducer(action, state)
    })
    this.effects.forEach(effect => {
      effect(action, state)
    })
    if (state != this.state) {
      this.log.debug(`DISPATCHING of "${action.type}" changed the state. Before:`, this.state, 'After:', state)
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
