import { useRef } from 'react'
import { usePrevious } from './usePrevious'

/**
 * Helper hook returning true if an observed prop- or state value
 * has changed during the render cycle. Use it within an `useEffect` hook
 * or similar to execute code whenever a value has safely changed between
 * renders.
 *
 * Read more about this pattern here:
 *
 * - https://legacy.reactjs.org/docs/hooks-faq.html#how-to-get-the-previous-props-or-state
 * - https://stackoverflow.com/questions/53446020/how-to-compare-oldvalues-and-newvalues-on-react-hooks-useeffect
 */
export function useHasChanged(val: any) {
  const prevVal = usePrevious(val)
  return prevVal !== val
}

/**
 * Like {@link useHasChanged}, but the returned value
 * can only be `true` once per render function execution
 * (i.e. one hook execution) per one change to `val`.
 * It does not remain being `true` until the actual render of the commponent,
 * like it is for `useHasChanged`.
 * Use this if you need to adjust some state based on some other state,
 * without causing a re-render that you'd get when using `useEffect`.
 *
 * It is this pattern:
 * https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes
 */
export function useHasChanged2(val: unknown, trueOnFirstRun = true): boolean {
  // `Symbol()` ensures that `val` is never equal to `prev.current`
  // on first run.
  const prev = useRef(trueOnFirstRun ? Symbol() : val)
  if (prev.current !== val) {
    prev.current = val
    return true
  }
  return false
}
