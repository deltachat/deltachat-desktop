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
