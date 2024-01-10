import React, { useEffect, useState } from 'react'

import AbsolutePositioningHelper from '../AbsolutePositioningHelper'

import styles from './styles.module.scss'

export default function ReactionsShortcutBar() {
  // @TODO: This is just for testing, remove it later
  const [position, setPosition] = useState({
    x: 0,
    y: 0,
  })
  useEffect(() => {
    const onEvent = ({ x, y }: MouseEvent) => {
      setPosition({ x, y })
    }

    window.addEventListener('mousedown', onEvent)

    return () => {
      window.removeEventListener('mousedown', onEvent)
    }
  }, [])

  return (
    <AbsolutePositioningHelper x={position.x} y={position.y}>
      <div className={styles.reactionsShortcutBar}>
        Hello, ReactionsShortcutBar!
      </div>
    </AbsolutePositioningHelper>
  )
}
