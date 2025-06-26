import { useCallback, useEffect, useMemo, useState } from 'react'
import { BackendRemote } from '../backend-com'

type Result<T> = { ok: true; value: T } | { ok: false; err: unknown }
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
type Ret<T extends (...args: any) => any> =
  | RetGeneric<T, true>
  | RetGeneric<T, false>

type AsyncFNoArgs = () => Promise<any>

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
 * This is similar to various `useFetch`. See
 * - https://react.dev/learn/reusing-logic-with-custom-hooks#when-to-use-custom-hooks
 * - https://nuxt.com/docs/api/composables/use-fetch
 * - https://vueuse.org/core/useFetch
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

  const [refreshDummyValue, _setRefreshDummyValue] = useState(0)
  const refresh = useCallback(() => _setRefreshDummyValue(old => old + 1), [])

  // We need this type to ensure that `fetchId`'s `useMemo` and `useEffect`
  // dependencies are in sync.
  type Dependencies = [typeof fn, typeof refreshDummyValue]
  /**
   * This value changes when and only when the dependencies
   * for the fetch change, i.e. when the `fn` itself changes.
   * That is, when we need to (and will) perform a new fetch.
   */
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const fetchId = useMemo(() => Symbol(), [
    fn,
    refreshDummyValue,
  ] as Dependencies)
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
 * This is similar to various `useFetch`. See
 * - https://react.dev/learn/reusing-logic-with-custom-hooks#when-to-use-custom-hooks
 * - https://nuxt.com/docs/api/composables/use-fetch
 * - https://vueuse.org/core/useFetch
 */
export function useFetch<Args extends SomeTuple, F extends AsyncF<Args>>(
  fn: F,
  /**
   * When `null`, the hook returns `null` and does not perform the fetch.
   */
  args: null | Args
): null | Ret<F> {
  const [arg0, arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9] =
    args ?? []
  if (args) {
    // Make sure that we're handling all arguments.
    const _assert: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 = args.length
  }

  type AnyArgs = (...args: SomeTuple) => ReturnType<typeof fn>

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

type MethodsOnly<T> = {
  [P in keyof T]: T[P] extends (...args: any) => any ? T[P] : never
}
type MethodOf<T> = MethodsOnly<T>[keyof MethodsOnly<T>]
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
  const methodBound = useMemo(() => method.bind(BackendRemote.rpc), [method])
  return useFetch(methodBound as (...args: SomeTuple) => Promise<any>, args)
}
