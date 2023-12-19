import React from 'react'
import classNames from 'classnames'

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
  const maskImage = `url(../images/icons/${icon}.svg)`

  return (
    <span
      className={classNames(styles.icon, className)}
      style={{
        WebkitMaskImage: maskImage,
        maskImage,
        height: `${size}px`,
        width: `${size}px`,
      }}
    />
  )
}
