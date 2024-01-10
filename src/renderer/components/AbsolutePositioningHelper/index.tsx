import React, { useState, useLayoutEffect, useRef } from 'react'

import styles from './styles.module.scss'

import type { ReactNode } from 'react'

type Props = {
  x: number
  y: number
  children?: ReactNode
}

export default function AbsolutePositioningHelper(props: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const [dimensions, setDimensions] = useState({
    refX: 0,
    refY: 0,
    refWidth: 0,
    refHeight: 0,
    windowWidth: window.innerWidth,
    windowHeight: window.innerHeight,
  })

  // Observe size & position changes of the wrapped "ref" element.
  //
  // Note: This does not adjust the element after window size changes. Usually
  // you want to cancel what you're doing with this component after a window
  // resize or scroll.
  useLayoutEffect(() => {
    if (!ref.current) {
      return
    }

    const refElem = ref.current

    const observer = new ResizeObserver(entries => {
      if (entries.length === 0) {
        return
      }

      const {
        x: refX,
        y: refY,
        width: refWidth,
        height: refHeight,
      } = entries[0].contentRect

      setDimensions({
        windowWidth: window.innerWidth,
        windowHeight: window.innerHeight,
        refX,
        refY,
        refWidth,
        refHeight,
      })
    })

    observer.observe(refElem)

    return () => {
      observer.unobserve(refElem)
    }
  }, [])

  // Adjust element position when displayed too far to the right
  const x =
    props.x + dimensions.refWidth > dimensions.windowWidth
      ? props.x - dimensions.refWidth
      : props.x

  // .. and when too far to the bottom
  const y =
    props.y + dimensions.refHeight > dimensions.windowHeight
      ? props.y - dimensions.refHeight
      : props.y

  return (
    <div
      style={{ left: `${x}px`, top: `${y}px` }}
      className={styles.absolutePositioningHelper}
      ref={ref}
    >
      {props.children}
    </div>
  )
}
