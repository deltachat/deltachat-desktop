import { useState } from 'react'
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
