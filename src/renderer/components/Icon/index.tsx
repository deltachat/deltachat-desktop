import React from 'react'

type Icons = 'open_in_new'

type Props = {
  size?: number
  icon: Icons
}

import styles from './styles.module.scss'

export default function Icon({ size = 20, icon }: Props) {
  return (
    <span
      className={styles.icon}
      style={{
        WebkitMask: `url(../images/icons/${icon}.svg) no-repeat center`,
        height: `${size}px`,
        width: `${size}px`,
      }}
    />
  )
}
