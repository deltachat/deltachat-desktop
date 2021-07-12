import { useRef, useEffect } from 'react'

export function useInitEffect(cb: () => void) {
  const init = useRef(false)
  useEffect(() => {
    if (!init.current) {
      cb()
      init.current = true
    }
  })
}
