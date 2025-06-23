import { useCallback, useEffect, useState } from 'react'
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
  const [result, setResult] = useState<Result<OkType> | null>(null)

  const [refreshDummyValue, _setRefreshDummyValue] = useState(0)
  const refresh = useCallback(() => _setRefreshDummyValue(old => old + 1), [])

  const [arg0, arg1, arg2, arg3, arg4, arg5, arg6] = args ?? []
  if (args) {
    // Make sure that we're handling all arguments.
    const _assert: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 = args.length
  }
  useEffect(() => {
    if (returnNull) {
      return
    }

    let outdated = false

    // If we do introduce `linger`, then `loading` will need to be a `useState`.
    // if (!options?.linger) {
    setResult(null)
    // }
    // TODO perf: somehow avoid re-render with this `setResult(null)`.
    // Maybe `useHasChanged2`

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
          setResult({ ok: true, value: value as any })
        }
      })
      .catch(err => {
        if (!outdated) {
          setResult({ ok: false, err })
        }
      })

    return () => {
      outdated = true
    }
  }, [
    method,
    returnNull,
    refreshDummyValue,
    // Not using just `args` in the dependency array
    // because it's expected to be a new array instance on every render.
    arg0,
    arg1,
    arg2,
    arg3,
    arg4,
    arg5,
    arg6,
  ])

  if (returnNull) {
    return null
  }
  // if (result != null && !result.ok) {
  //   throw result.err
  // }
  const loading = result === null
  if (loading) {
    // Yes, the return value is the same. Stupid, but makes TypeScript happy.
    return {
      loading,
      result,
      refresh,
    }
  }
  return {
    loading,
    result,
    refresh,
  }
}
