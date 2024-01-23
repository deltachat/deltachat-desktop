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
    const handleClick = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        onClick()
      }
    }

    window.addEventListener('click', handleClick)

    return () => {
      window.removeEventListener('click', handleClick)
    }
  }, [onClick])

  return <div ref={ref}>{children}</div>
}
