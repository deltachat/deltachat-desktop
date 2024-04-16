import usePrevious from './usePrevious'

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
export default function useHasChanged(val: any) {
  const prevVal = usePrevious(val)
  return prevVal !== val
}
