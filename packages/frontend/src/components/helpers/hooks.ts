import { useEffect, useRef } from 'react'

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
