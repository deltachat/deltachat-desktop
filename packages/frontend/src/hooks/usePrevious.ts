import { useEffect, useRef } from 'react'

/**
 * Helper hook to look at the previous prop- or state value
 * during the render cycle.
 *
 * Read more about this pattern here:
 *
 * - https://legacy.reactjs.org/docs/hooks-faq.html#how-to-get-the-previous-props-or-state
 * - https://stackoverflow.com/questions/53446020/how-to-compare-oldvalues-and-newvalues-on-react-hooks-useeffect
 */
export function usePrevious(value: any) {
  const ref = useRef(undefined)
  useEffect(() => {
    ref.current = value
  })
  // eslint-disable-next-line react-hooks/refs
  return ref.current
}

/**
 * Like {@link usePrevious}, but the returned value is from the previous
 * execution of this hook (i.e. previous render function execution),
 * and not from the previous actual render (not `useEffect`).
 *
 * It is this pattern:
 * https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes
 *
 * @returns `undefined` on initial run,
 * otherwise the `val` from the previous run of the hook.
 */
export function usePrevious2<T>(val: T): T | undefined {
  const prevRef = useRef<T>(undefined)
  // eslint-disable-next-line react-hooks/refs
  const prev = prevRef.current
  // eslint-disable-next-line react-hooks/refs
  prevRef.current = val
  return prev
}
