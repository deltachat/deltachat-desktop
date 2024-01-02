import classNames from 'classnames'
import React from 'react'

export type IconName =
  | 'arrow-left'
  | 'bell'
  | 'brightness-6'
  | 'code-tags'
  | 'cross'
  | 'devices'
  | 'favorite'
  | 'forum'
  | 'lead-pencil'
  | 'list'
  | 'open_in_new'
  | 'person'
  | 'swap_vert'

type Props = {
  className?: string
  icon: IconName
  size?: number
}

import styles from './styles.module.scss'

export default function Icon({ size = 20, icon, className }: Props) {
  return (
    <span
      className={classNames(styles.icon, className)}
      style={{
        WebkitMask: `url(../images/icons/${icon}.svg) no-repeat center`,
        height: `${size}px`,
        width: `${size}px`,
      }}
    />
  )
}
