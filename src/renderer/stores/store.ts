import { useState, useEffect } from 'react'
import logger from '../../shared/logger'

export function useStore<T extends Store<any>>(
  StoreInstance: T
): [T extends Store<infer S> ? S : any, T["dispatch"]] {
  const [state, setState] = useState(StoreInstance.getState())

  useEffect(() => {
    StoreInstance.subscribe(setState)
    return () => StoreInstance.unsubscribe(setState)
  }, [])
  // TODO: better return an object to allow destructuring
  return [state, StoreInstance.dispatch.bind(StoreInstance)]
}

export interface Action {
  type: string
  payload?: any
  id?: number
}

export class Store<S> {
  private listeners: todo[] = []
  public reducers: todo[] = []
  public effects: todo[] = []
  private _log: ReturnType<typeof logger.getLogger>
  constructor(public state: S, name?: string) {
    if (!name) name = 'Store'
    this._log = logger.getLogger('renderer/stores/' + name)
  }

  get log() {
    return this._log
  }

  getState() {
    return this.state
  }

  dispatch(action: Action) {
    this.log.debug('DISPATCH:', action)
    let state = this.state
    this.reducers.forEach(reducer => {
      state = reducer(action, state)
    })
    this.effects.forEach(effect => {
      effect(action, state)
    })
    if (state !== this.state) {
      this.log.debug(
        `DISPATCHING of "${action.type}" changed the state. Before:`,
        this.state,
        'After:',
        state
      )
      this.state = state
      this.listeners.forEach(listener => listener(this.state))
    }
  }

  subscribe(listener: todo) {
    this.listeners.push(listener)
    return this.unsubscribe.bind(this, listener)
  }

  unsubscribe(listener: todo) {
    const index = this.listeners.indexOf(listener)
    this.listeners.splice(index, 1)
  }

  setState(state: S) {
    this.state = state
    this.listeners.forEach(listener => listener(this.state))
  }
}

/* TODO

- function to attach effects and reducers
(so that we can make them protected/private again and give the callback functions types)
- partial state update (location fetches the old state)?

- resolve 'todo' types

*/
