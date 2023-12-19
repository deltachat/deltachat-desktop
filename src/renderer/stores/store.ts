import { useState, useEffect } from 'react'
import { getLogger } from '../../shared/logger'

export function useStore<T extends Store<any>>(
  StoreInstance: T
): [T extends Store<infer S> ? S : any, T['dispatch']] {
  const [state, setState] = useState(StoreInstance.getState())

  useEffect(() => StoreInstance.subscribe(setState), [StoreInstance])
  // TODO: better return an object to allow destructuring
  return [state, StoreInstance.dispatch.bind(StoreInstance)]
}

export interface Action {
  type: string
  payload?: any
  id?: number
}

export class Store<S> {
  private listeners: ((state: S) => void)[] = []
  private reducers: ((action: Action, state: S) => S)[] = []
  private effects: ((action: Action, state: S) => void)[] = []
  private _log: ReturnType<typeof getLogger>
  constructor(
    public state: S,
    name?: string
  ) {
    if (!name) name = 'Store'
    this._log = getLogger('renderer/stores/' + name)
  }

  get log() {
    return this._log
  }

  getState() {
    return this.state
  }

  dispatch(action: Action) {
    this.log.debug('DISPATCH of type', action.type)
    //this.log.debug('DISPATCH:', action)

    let state = this.state
    this.reducers.forEach(reducer => {
      state = reducer(action, state)
    })
    this.effects.forEach(effect => {
      effect(action, state)
    })
    if (state !== this.state) {
      // this.log.debug(
      //   `DISPATCHING of "${action.type}" changed the state. Before:`,
      //   this.stateToHumanReadable(this.state),
      //   'After:',
      //   this.stateToHumanReadable(state)
      // )
      this.log.debug(`DISPATCHING of "${action.type}" changed the state.`)
      this.state = state
      this.listeners.forEach(listener => listener(this.state))
    }
  }

  subscribe(listener: (state: S) => void) {
    this.listeners.push(listener)
    return this.unsubscribe.bind(this, listener)
  }

  unsubscribe(listener: (state: S) => void) {
    const index = this.listeners.indexOf(listener)
    if (index !== -1) this.listeners.splice(index, 1)
  }

  attachEffect(effect: (action: Action, state: S) => void) {
    this.effects.push(effect)
  }

  attachReducer(reducer: (action: Action, state: S) => S) {
    this.reducers.push(reducer)
  }

  setState(
    stateReducer: (currentState: S) => S | undefined,
    description: String
  ) {
    const modifiedState = stateReducer(this.state)
    if (modifiedState === undefined) return
    // this.log.debug(
    //   `${description} changed the state. Before:`,
    //   this.stateToHumanReadable(this.state),
    //   'After:',
    //   this.stateToHumanReadable(modifiedState)
    // )
    this.log.debug(`${description} changed the state`)
    this.state = modifiedState
    this.listeners.forEach(listener => listener(this.state))
  }

  stateToHumanReadable(state: S): any {
    return state
  }

  toHumanReadableString(): string {
    return this.stateToHumanReadable(this.state)
  }
}

/* TODO

- partial state update (location fetches the old state)?

*/
