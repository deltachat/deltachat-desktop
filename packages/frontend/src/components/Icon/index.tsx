import React from 'react'
import classNames from 'classnames'

import styles from './styles.module.scss'

export type IconName =
  | 'apps'
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
  | 'download'
  | 'eye-off'
  | 'eye-open'
  | 'favorite'
  | 'forum'
  | 'image'
  | 'image_outline'
  | 'info'
  | 'ios_share'
  | 'ios_share_modified'
  | 'lead-pencil'
  | 'list'
  | 'map'
  | 'minus'
  | 'more'
  | 'more_vert'
  | 'open_in_new'
  | 'palette'
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
  | 'sell'
  | 'settings'
  | 'share'
  | 'swap_vert'
  | 'swap_hor'
  | 'undo'
  | 'upload-file'

type PropsBase = {
  className?: string
  onClick?: (ev: Event | React.SyntheticEvent<Element, Event>) => void
  icon: IconName
  coloring?: keyof Omit<typeof styles, 'icon'>
  size?: number
  rotation?: number
}
type JustIconProps = PropsBase & {
  /** Consider using IconButton instead */
  onClick?: undefined
}
type IconButtonProps = PropsBase & {
  'aria-label': string
}

export default function Icon({
  coloring,
  size = 20,
  rotation = 0,
  icon,
  className,
}: JustIconProps) {
  return (
    <span
      className={classNames(
        styles.icon,
        coloring && styles[coloring],
        className
      )}
      style={{
        transform: `rotate(${rotation}deg)`,
        WebkitMaskImage: `url(./images/icons/${icon}.svg)`,
        height: `${size}px`,
        width: `${size}px`,
      }}
    />
  )
}

export function IconButton({
  coloring,
  size,
  rotation,
  icon,
  ...rest
}: IconButtonProps) {
  return (
    <button {...rest} className={classNames(styles.iconButton)}>
      <Icon coloring={coloring} size={size} rotation={rotation} icon={icon} />
    </button>
  )
}
