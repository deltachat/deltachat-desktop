import React from 'react'

import styles from './styles.module.scss'

type Props = {
  size?: number
}

export default function Spinner({ size = 50 }: Props) {
  return <div style={{ width: `${size}px` }} className={styles.spinner} />
}
