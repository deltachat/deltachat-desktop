import React, { useEffect, useRef } from 'react'

import type { PropsWithChildren } from 'react'

type Props = {
  onClick: () => void
}

/**
 * Helper component which will call a function as soon as a click _outside_ of
 * the children components was detected.
 */
export default function OutsideClickHelper({
  onClick,
  children,
}: PropsWithChildren<Props>) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClick = (event: MouseEvent | TouchEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        onClick()
      }
    }

    document.addEventListener('mousedown', handleClick)
    document.addEventListener('touchstart', handleClick)

    return () => {
      document.removeEventListener('mousedown', handleClick)
      document.removeEventListener('touchstart', handleClick)
    }
  }, [onClick])

  return <div ref={ref}>{children}</div>
}
