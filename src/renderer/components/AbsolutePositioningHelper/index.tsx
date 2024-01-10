import React, { useState, useLayoutEffect, useRef } from 'react'

import styles from './styles.module.scss'

import type { ReactNode } from 'react'

type Props = {
  /** Desired x position of element, usually determined by a user click event */
  x: number

  /** Desired y position of element, usually determined by a user click event */
  y: number

  /** Element which will be absolutely positioned and automatically adjusted */
  children: ReactNode
}

/**
 * Helper component which fixes it's wrapped components absolutely on the screen,
 * if possible, centered and above the desired position. The position is usually
 * determined by an user mouse event.
 *
 * Additionally it makes sure the wrapped components are not crossing the window's
 * boundaries. In that case the position will be automatically adjusted.
 *
 * Note: This does not adjust the element after window size changes. Usually you
 * want to cancel what you're doing with this component after a window resize
 * or scroll.
 */
export default function AbsolutePositioningHelper(props: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const [dimensions, setDimensions] = useState({
    refWidth: 0,
    refHeight: 0,
    windowWidth: window.innerWidth,
    windowHeight: window.innerHeight,
  })

  // Observe size & position changes of the wrapped "ref" element.
  useLayoutEffect(() => {
    if (!ref.current) {
      return
    }

    const refElem = ref.current

    const observer = new ResizeObserver(entries => {
      if (entries.length === 0) {
        return
      }

      const { width: refWidth, height: refHeight } = entries[0].contentRect

      setDimensions({
        windowWidth: window.innerWidth,
        windowHeight: window.innerHeight,
        refWidth,
        refHeight,
      })
    })

    observer.observe(refElem)

    return () => {
      observer.unobserve(refElem)
    }
  }, [])

  let x

  // Adjust element position to be centered
  x = props.x - dimensions.refWidth / 2

  // Change the x position when it is too far to the right and leaving the window
  if (x + dimensions.refWidth > dimensions.windowWidth) {
    x = props.x - dimensions.refWidth
  }

  // .. and when it is too far to the left
  if (x < dimensions.refWidth / 2) {
    x = props.x
  }

  let y

  // Adjust element to be above the initial y position
  y = props.y - dimensions.refHeight

  // Change the y position when it is too far to the top and leaving the window
  if (y < dimensions.refHeight) {
    y = props.y
  }

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
