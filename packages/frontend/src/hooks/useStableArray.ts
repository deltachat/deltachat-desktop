import { useRef } from 'react'

/**
 * Returns the array from the previous render if the new array
 * is shallowly equal to it, so that the returned value keeps
 * a stable identity as long as the content doesn't change.
 *
 * Similar pattern as in {@link usePrevious2}:
 * https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes
 */
export function useStableArray<T>(arr: T[]): T[] {
  /* eslint-disable react-hooks/refs */
  const prevRef = useRef(arr)
  const prev = prevRef.current
  if (prev === arr) {
    return arr
  }
  if (prev.length === arr.length && arr.every((item, i) => item === prev[i])) {
    return prev
  }
  prevRef.current = arr
  return arr
  /* eslint-enable react-hooks/refs */
}
