import React, { useEffect, useRef } from 'react'

import type { PropsWithChildren } from 'react'

type Props = {
  onClick: () => void
}

/**
 * Helper component which will call a function as soon as a click _outside_ of
 * the children components was detected.
 */
export default function OutsideClickHelper(props: PropsWithChildren<Props>) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        props.onClick()
      }
    }

    window.addEventListener('click', onClick)

    return () => {
      window.removeEventListener('click', onClick)
    }
  })

  return <div ref={ref}>{props.children}</div>
}
