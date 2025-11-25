import { RefObject, useEffect, useRef, useState } from 'react'
import { debounce } from 'debounce'

/** debounce workaround so it can be useful in useFunctions that are used from multiple places at once
 * if defining normally inside it can get redefined, so the delay could be skipped
 * and if defined outside the delay is global/shared between all instances which results in problems.
 * (function call gets skipped for some instances)
 */
export function useDebounced<ARGS, RET>(
  func: (...any: ARGS[]) => RET,
  delay: number
): (...any: ARGS[]) => RET {
  return useState(() => debounce(func, delay))[0]
}

// This hook provides a simple reference lock.
export function useRefLock(): {
  isLocked: () => boolean
  setLock: (lock: boolean) => void
} {
  const lockRef = useRef<boolean>(false)
  const stableRef = useRef<any>({
    isLocked: () => {
      return lockRef.current === true
    },
    setLock: (lock: boolean) => {
      return (lockRef.current = lock)
    },
  }) as RefObject<any>
  // This ref contains stable methods and never changes after initialization
  // eslint-disable-next-line react-hooks/refs
  return stableRef.current
}

// Effect that only runs when component is first rendered/initiated
// Probably this can get deprecated and replaced with `useEffect(() =>..., [])`
export function useInitEffect(cb: () => void) {
  const init = useRef(false)
  useEffect(() => {
    if (!init.current) {
      cb()
      init.current = true
    }
  })
}
