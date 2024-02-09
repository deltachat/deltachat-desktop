import React from 'react'
import classNames from 'classnames'

import styles from './styles.module.scss'

export type IconName =
  | 'arrow-left'
  | 'bell'
  | 'brightness-6'
  | 'code-tags'
  | 'cross'
  | 'devices'
  | 'favorite'
  | 'forum'
  | 'image'
  | 'info'
  | 'lead-pencil'
  | 'list'
  | 'more'
  | 'open_in_new'
  | 'person'
  | 'qr'
  | 'question_mark'
  | 'reaction'
  | 'swap_vert'

type Props = {
  className?: string
  icon: IconName
  size?: number
}

export default function Icon({ size = 20, icon, className }: Props) {
  return (
    <span
      className={classNames(styles.icon, className)}
      style={{
        WebkitMaskImage: `url(../images/icons/${icon}.svg)`,
        height: `${size}px`,
        width: `${size}px`,
      }}
    />
  )
}
