import { useCallback, useEffect, useMemo, useState } from 'react'
import { BackendRemote } from '../backend-com'
import { getLogger } from '@deltachat-desktop/shared/logger'

const log = getLogger('renderer/hooks/useFetch')

/**
 * Possible results of an async operation - either success with a value
 * or failure with an error
 */
type Result<T> = { ok: true; value: T } | { ok: false; err: unknown }

/**
 * Generic return type for fetch hooks with conditional loading state.
 * Uses TypeScript's conditional types to ensure type safety based on loading state.
 */
type RetGeneric<T extends (...args: any) => any, Loading extends boolean> = {
  readonly loading: Loading
  /**
   * `null` when {@link RetGeneric.loading loading} === true
   */
  readonly result: Loading extends true ? null : Result<Awaited<ReturnType<T>>>
  /**
   * Similar to {@link RetGeneric.result | `result`}, but when a new fetch
   * is in progress, this returns the result of the previous fetch.
   * When no fetch is in progress, this is equal to
   * {@link RetGeneric.result | `result`}.
   */
  readonly lingeringResult: Loading extends true
    ? null | Result<Awaited<ReturnType<T>>>
    : Result<Awaited<ReturnType<T>>>
  readonly refresh: () => void
}

/**
 * Union type representing the two possible states of a fetch hook
 */
type Ret<T extends (...args: any) => any> =
  | RetGeneric<T, true>
  | RetGeneric<T, false>

type AsyncFNoArgs = () => Promise<any>

/**
 * This hook provides a generic way to fetch data from an async function.
 * Similar to various `useFetch` implementations. See
 * - https://react.dev/learn/reusing-logic-with-custom-hooks#when-to-use-custom-hooks
 * - https://nuxt.com/docs/api/composables/use-fetch
 * - https://vueuse.org/core/useFetch
 *
 * Key features:
 * - Automatic refetching when dependencies change
 * - Prevents race conditions with fetch ID tracking
 * - Maintains previous results during loading (lingeringResult)
 * - Manual refresh capability
 */

export function useFetchGeneric(fn: null): null
export function useFetchGeneric<F extends AsyncFNoArgs>(fn: F): Ret<F>
export function useFetchGeneric<F extends AsyncFNoArgs>(
  fn: null | F
): null | Ret<F>

/**
 * Invokes `fn` every time it changes.
 *
 * Most of the time, using {@link useFetch} or {@link useRpcFetch}
 * would be more convenient.
 *
 */
export function useFetchGeneric<F extends AsyncFNoArgs>(
  /**
   * When `null`, the hook returns `null` and does not perform the fetch.
   */
  fn: F | null
): null | Ret<F> {
  const returnNull = fn == null
  type OkType = Awaited<ReturnType<F>>

  const [resultAndFetchId, setResultAndFetchId] = useState<null | {
    result: Result<OkType>
    /**
     * This is needed to keep track of whether we have finished fetching
     * the newest data after the last dependencies change
     * (or after the initial render).
     *
     * Yes, we could have used just `setResult(null)` when we need a new fetch
     * (together with `const loading = result === null`),
     * but that would cause a re-render (which is not good for performance).
     */
    fetchId: typeof fetchId
  }>(null)

  /**
   * Dummy state used to trigger manual refreshes.
   * Incrementing this value forces a new fetch.
   */
  const [refreshDummyValue, _setRefreshDummyValue] = useState(0)
  const refresh = useCallback(() => _setRefreshDummyValue(old => old + 1), [])

  // We need this type to ensure that `fetchId`'s `useMemo` and `useEffect`
  // dependencies are in sync.
  type Dependencies = [typeof fn, typeof refreshDummyValue]
  /**
   * This value changes when and only when the dependencies
   * for the fetch change, i.e. when the `fn` itself changes.
   * That is, when we need to (and will) perform a new fetch.
   *
   * Using Symbol() ensures each fetch has a unique identifier.
   */
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const fetchId = useMemo(() => Symbol(), [
    fn,
    refreshDummyValue,
  ] as Dependencies)

  /**
   * Determines if we're currently loading by comparing the current fetchId
   * with the fetchId of the most recent completed fetch.
   */
  const loading = resultAndFetchId?.fetchId !== fetchId
  type DependenciesWithFetchId = [...Dependencies, typeof fetchId]

  useEffect(
    () => {
      if (fn == null) {
        return
      }

      let outdated = false

      fn()
        .then(value => {
          if (!outdated) {
            setResultAndFetchId({
              result: { ok: true, value: value as any },
              fetchId,
            })
          }
        })
        .catch(err => {
          if (!outdated) {
            setResultAndFetchId({
              result: { ok: false, err },
              fetchId,
            })
            log.errorWithoutStackTrace('error while executing fetch', err)
          }
        })

      return () => {
        outdated = true
      }
    },
    [fn, refreshDummyValue, fetchId] as DependenciesWithFetchId
  )

  if (returnNull) {
    return null
  }
  // if (result != null && !result.ok) {
  //   throw result.err
  // }
  if (loading) {
    return {
      loading,
      result: null,
      lingeringResult: resultAndFetchId ? resultAndFetchId.result : null,
      refresh,
    }
  }
  return {
    loading,
    result: resultAndFetchId.result,
    lingeringResult: resultAndFetchId.result,
    refresh,
  }
}

/**
 * Type for async functions that take arguments
 */
type AsyncF<A extends any[]> = (...args: A) => Promise<any>
type SomeTuple =
  | []
  | [any]
  | [any, any]
  | [any, any, any]
  | [any, any, any, any]
  | [any, any, any, any, any]
  | [any, any, any, any, any, any]
  | [any, any, any, any, any, any, any]
  | [any, any, any, any, any, any, any, any]
  | [any, any, any, any, any, any, any, any, any]
  | [any, any, any, any, any, any, any, any, any, any]

export function useFetch<Args extends SomeTuple, F extends AsyncF<Args>>(
  fn: F,
  args: null
): null
export function useFetch<Args extends SomeTuple, F extends AsyncF<Args>>(
  fn: F,
  args: Args
): Ret<F>
export function useFetch<Args extends SomeTuple, F extends AsyncF<Args>>(
  fn: F,
  args: null | Args
): null | Ret<F>

/**
 * A specific implementation of {@link useFetchGeneric} that handles
 * functions with arguments.
 */
export function useFetch<Args extends SomeTuple, F extends AsyncF<Args>>(
  fn: F,
  /**
   * When `null`, the hook returns `null` and does not perform the fetch.
   */
  args: null | Args
): null | Ret<F> {
  /**
   * Destructure arguments to individual variables.
   * This allows us to use them as dependencies in useCallback.
   */
  const [arg0, arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9] =
    args ?? []
  if (args) {
    // Make sure that we're handling all arguments.
    const _assert: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 = args.length
  }

  type AnyArgs = (...args: SomeTuple) => ReturnType<typeof fn>

  /**
   * Create a function with no arguments that calls the original function
   * with the provided arguments. This allows us to use useFetchGeneric.
   */
  const fnNoArgs = useCallback(
    () =>
      (fn as unknown as AnyArgs)(
        arg0,
        arg1,
        arg2,
        arg3,
        arg4,
        arg5,
        arg6,
        arg7,
        arg8,
        arg9
      ),
    [fn, arg0, arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9]
  )
  return useFetchGeneric(args ? fnNoArgs : null)
}

/**
 * Utility type that represents only method properties from an object type.
 */
type MethodsOnly<T> = {
  [P in keyof T]: T[P] extends (...args: any) => any ? T[P] : never
}

/**
 * Union type of all method types from an object.
 * This gives us a union of all possible method signatures.
 */
type MethodOf<T> = MethodsOnly<T>[keyof MethodsOnly<T>]

/**
 * Type representing all available RPC methods from BackendRemote.rpc (Type RawClient)
 */
type MethodOfRpc = MethodOf<typeof BackendRemote.rpc>

export function useRpcFetch<Method extends MethodOfRpc>(
  method: Method,
  args: null
): null
export function useRpcFetch<
  Method extends MethodOfRpc,
  Args extends Parameters<Method>,
>(method: Method, args: Args): Ret<Method>
export function useRpcFetch<
  Method extends MethodOfRpc,
  Args extends null | Parameters<Method>,
>(method: Method, args: Args): null | Ret<Method>

/**
 * A (possibly) more convenient version of {@link useFetch},
 * when dealing with `BackendRemote.rpc` calls.
 *
 * Namely, it allows you to pass `BackendRemote.rpc` methods directly
 * as the `method` arg, without having to worry about the `this` value.
 *
 * @example
 * useRpcFetch(BackendRemote.rpc.getMessage, [accId, msgId])
 */
export function useRpcFetch<
  Method extends MethodOfRpc,
  Args extends null | Parameters<Method>,
>(
  method: Method,
  /**
   * When `null`, the hook returns `null` and does not perform the fetch.
   */
  args: Args
): null | Ret<Method> {
  /**
   * Bind the method to BackendRemote.rpc to ensure it's called
   * with the correct 'this' context.
   */
  const methodBound = useMemo(() => method.bind(BackendRemote.rpc), [method])
  return useFetch(methodBound as (...args: SomeTuple) => Promise<any>, args)
}
