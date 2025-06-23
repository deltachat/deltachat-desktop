import { useCallback, useEffect, useMemo, useState } from 'react'
import { BackendRemote } from '../backend-com'

type MethodsOnly<T> = {
  [P in keyof T]: T[P] extends (...args: any) => any ? T[P] : never
}
type MethodOf<T> = MethodsOnly<T>[keyof MethodsOnly<T>]
type Result<T> = { ok: true; value: T } | { ok: false; err: unknown }
type MethodOfRpc = MethodOf<typeof BackendRemote.rpc>
type RetGeneric<T extends MethodOfRpc, Loading extends boolean> = {
  readonly loading: Loading
  /**
   * `null` when {@link RetGeneric.loading loading} === true
   */
  readonly result: Loading extends true ? null : Result<Awaited<ReturnType<T>>>
  readonly refresh: () => void
}
type Ret<T extends MethodOfRpc> = RetGeneric<T, true> | RetGeneric<T, false>

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
 * This is similar to various `useFetch`. See
 * - https://react.dev/learn/reusing-logic-with-custom-hooks#when-to-use-custom-hooks
 * - https://nuxt.com/docs/api/composables/use-fetch
 * - https://vueuse.org/core/useFetch
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
  // options?: {
  //   /** Whether to keep the old result while the new one is being loaded */
  //   linger?: boolean
  // }
): null | Ret<Method> {
  const returnNull = args == null
  type OkType = Awaited<ReturnType<Method>>

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

  const [arg0, arg1, arg2, arg3, arg4, arg5, arg6] = args ?? []
  if (args) {
    // Make sure that we're handling all arguments.
    const _assert: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 = args.length
  }

  // We need this type to ensure that `fetchId`'s `useMemo` and `useEffect`
  // dependencies are in sync.
  type Dependencies = [
    typeof method,
    typeof returnNull,
    typeof refreshDummyValue,
    // Not using just `args` in the dependency array
    // because it's expected to be a new array instance on every render.
    typeof arg0,
    typeof arg1,
    typeof arg2,
    typeof arg3,
    typeof arg4,
    typeof arg5,
    typeof arg6,
  ]
  /**
   * This value changes when and only when the dependencies
   * for the RPC fetch change.
   * That is, when we need to (and will) perform a new fetch.
   */
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const fetchId = useMemo(() => Symbol(), [
    method,
    returnNull,
    refreshDummyValue,
    arg0,
    arg1,
    arg2,
    arg3,
    arg4,
    arg5,
    arg6,
  ] as Dependencies)
  const loading = resultAndFetchId?.fetchId !== fetchId
  type DependenciesWithFetchId = [...Dependencies, typeof fetchId]

  useEffect(
    () => {
      if (returnNull) {
        return
      }

      let outdated = false

      const method_ = method.bind(BackendRemote.rpc)
      method_(
        arg0 as never,
        arg1 as never,
        arg2 as never,
        arg3 as never,
        arg4 as never,
        arg5 as never,
        arg6 as never
      )
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
    [
      method,
      returnNull,
      refreshDummyValue,
      arg0,
      arg1,
      arg2,
      arg3,
      arg4,
      arg5,
      arg6,
      fetchId,
    ] as DependenciesWithFetchId
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
      refresh,
    }
  }
  return {
    loading,
    result: resultAndFetchId.result,
    refresh,
  }
}
