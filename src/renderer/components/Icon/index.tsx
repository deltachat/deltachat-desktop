import React from 'react'
import classNames from 'classnames'

import styles from './styles.module.scss'

export type IconName =
  | 'arrow-left'
  | 'audio-muted'
  | 'bell'
  | 'brightness-6'
  | 'chats'
  | 'code-tags'
  | 'cross'
  | 'devices'
  | 'favorite'
  | 'forum'
  | 'image'
  | 'info'
  | 'lead-pencil'
  | 'list'
  | 'map'
  | 'media'
  | 'more'
  | 'open_in_new'
  | 'paperclip'
  | 'person'
  | 'person-filled'
  | 'phone'
  | 'qr'
  | 'question_mark'
  | 'reaction'
  | 'settings'
  | 'swap_vert'
  | 'undo'
  | 'upload-file'

type Props = {
  className?: string
  icon: IconName
  coloring?: string
  size?: number
  rotation?: number
}

export default function Icon({
  coloring = 'primary',
  size = 20,
  rotation = 0,
  icon,
  className,
}: Props) {
  return (
    <span
      className={classNames(
        styles.icon,
        coloring && styles[coloring],
        className
      )}
      style={{
        transform: `rotate(${rotation}deg)`,
        WebkitMaskImage: `url(../images/icons/${icon}.svg)`,
        height: `${size}px`,
        width: `${size}px`,
      }}
    />
  )
}
