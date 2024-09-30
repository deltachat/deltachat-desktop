import React from 'react'
import classNames from 'classnames'

import styles from './styles.module.scss'

export type IconName =
  | 'arrow-left'
  | 'audio-muted'
  | 'bell'
  | 'brightness-6'
  | 'chats'
  | 'chevron-left'
  | 'chevron-right'
  | 'code-tags'
  | 'cross'
  | 'devices'
  | 'eye-off'
  | 'eye-open'
  | 'favorite'
  | 'forum'
  | 'image'
  | 'info'
  | 'lead-pencil'
  | 'list'
  | 'map'
  | 'media'
  | 'minus'
  | 'more'
  | 'open_in_new'
  | 'paperclip'
  | 'person'
  | 'person-filled'
  | 'phone'
  | 'plus'
  | 'rotate-right'
  | 'qr'
  | 'question_mark'
  | 'reaction'
  | 'reset-image'
  | 'settings'
  | 'swap_vert'
  | 'swap_hor'
  | 'tint'
  | 'undo'
  | 'upload-file'

type Props = {
  className?: string
  onClick?: (ev: Event | React.SyntheticEvent<Element, Event>) => void
  icon: IconName
  coloring?: keyof Omit<typeof styles, 'icon'>
  size?: number
  rotation?: number
}

export default function Icon({
  coloring,
  size = 20,
  rotation = 0,
  icon,
  className,
  onClick,
}: Props) {
  return (
    <span
      className={classNames(
        styles.icon,
        coloring && styles[coloring],
        className
      )}
      onClick={onClick}
      style={{
        transform: `rotate(${rotation}deg)`,
        WebkitMaskImage: `url(./images/icons/${icon}.svg)`,
        height: `${size}px`,
        width: `${size}px`,
      }}
    />
  )
}
