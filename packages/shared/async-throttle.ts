/** This code comes originally from https://github.com/jcoreio/async-throttle
 * And was rewritten to TS by us
 * @license {MIT}
 */

export class CanceledError extends Error {
  name = 'CanceledError'
  constructor() {
    super('throttled invocation was canceled')
  }
}

type TimeoutID = NodeJS.Timeout | string | number | undefined

class Delay implements Promise<void> {
  ready: Promise<void> | null
  resolve!: () => void
  canceled: boolean = false
  timeout: TimeoutID

  constructor(lastInvocationDone: Promise<any>, wait: number) {
    const delay = new Promise(
      (resolve: (_value: never) => void, _reject: (reason: any) => void) => {
        this.timeout = setTimeout(resolve, wait)
        this.resolve = resolve as () => void
      }
    )
    this.ready = lastInvocationDone
      .then(
        () => delay,
        () => delay
      )
      .then(() => {
        this.ready = null
      })
  }
  catch<TResult = never>(
    _onrejected?:
      | ((reason: any) => TResult | PromiseLike<TResult>)
      | null
      | undefined
  ): Promise<void> {
    throw new Error('Method not implemented.')
  }
  finally(_onfinally?: (() => void) | null | undefined): Promise<void> {
    throw new Error('Method not implemented.')
  }
  [Symbol.toStringTag]: string = 'Delay'

  flush() {
    clearTimeout(this.timeout)
    this.resolve()
  }

  cancel() {
    this.canceled = true
    clearTimeout(this.timeout)
    this.resolve()
  }

  then<T>(handler: () => Promise<T>): Promise<T> {
    return (this.ready || Promise.resolve()).then((): Promise<T> => {
      if (this.canceled) throw new CanceledError()
      return handler()
    })
  }
}

export type ThrottledFunction<Args extends any[], Value> = {
  (...args: Args): Promise<Value>
  invokeIgnoreResult: (...args: Args) => void
  cancel: () => Promise<void>
  flush: () => Promise<void>
}

export function asyncThrottle<Args extends any[], Value>(
  fn: (...args: Args) => Value | Promise<Value>,
  _wait?: number | null,
  options?: {
    getNextArgs?: (args0: Args, args1: Args) => Args
  }
): ThrottledFunction<Args, Value> {
  const wait = _wait != null && Number.isFinite(_wait) ? Math.max(_wait, 0) : 0
  const getNextArgs = options?.getNextArgs || ((prev, next) => next)

  let nextArgs: Args | null
  let lastInvocationDone: Promise<any> | null = null
  let delay: Delay | null = null
  let nextInvocation: Promise<Value> | null = null

  function invoke(): Promise<Value> {
    const args = nextArgs
    // istanbul ignore next
    if (!args) {
      return Promise.reject(new Error('unexpected error: nextArgs is null'))
    }
    nextInvocation = null
    nextArgs = null
    const result = Promise.resolve(fn(...args))
    lastInvocationDone = result
      .catch(() => {})
      .then(() => {
        lastInvocationDone = null
      })
    delay = new Delay(lastInvocationDone, wait)
    return result
  }

  function setNextArgs(args: Args) {
    nextArgs = nextArgs ? getNextArgs(nextArgs, args) : args
    if (!nextArgs) throw new Error('unexpected error: nextArgs is null')
  }

  function doInvoke(): Promise<Value> {
    nextInvocation = (delay || Promise.resolve()).then(invoke)
    return nextInvocation
  }
  function wrapper(...args: Args): Promise<Value> {
    try {
      setNextArgs(args)
    } catch (error) {
      return Promise.reject(error)
    }
    return nextInvocation || doInvoke()
  }

  /**
   * Calls the throttled function soon, but doesn't return a promise, catches
   * any CanceledError, and doesn't create any new promises if a call is already
   * pending.
   *
   * The throttled function should handle all errors internally,
   * e.g.:
   *
   * asyncThrottle(async () => {
   *   try {
   *     await foo()
   *   } catch (err) {
   *     // handle error
   *   }
   * })
   *
   * If the throttled function throws an error or returns a promise that is
   * eventually rejected, the runtime's unhandled promise rejection handler will
   * be called, which may crash the process, route the rejection to a handler
   * that has been previously registered, or ignore the rejection, depending
   * on the runtime and your code.
   */
  wrapper.invokeIgnoreResult = (...args: Args) => {
    setNextArgs(args)
    if (!nextInvocation) {
      doInvoke().catch((err: any) => {
        if (!(err instanceof CanceledError)) {
          // trigger the unhandled promise rejection handler
          throw err
        }
      })
    }
  }

  wrapper.cancel = async (): Promise<void> => {
    const prevLastInvocationDone = lastInvocationDone
    delay?.cancel?.()
    nextInvocation = null
    nextArgs = null
    lastInvocationDone = null
    delay = null
    await prevLastInvocationDone
  }

  wrapper.flush = async (): Promise<void> => {
    delay?.flush?.()
    await lastInvocationDone
  }

  return wrapper
}
