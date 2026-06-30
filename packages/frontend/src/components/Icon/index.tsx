import React from 'react'
import classNames from 'classnames'

import styles from './styles.module.scss'

export type IconName =
  | 'apps'
  | 'archive'
  | 'arrow-left'
  | 'audio-muted'
  | 'bell'
  | 'brightness-6'
  | 'camera'
  | 'chat_bubble'
  | 'chevron-left'
  | 'chevron-right'
  | 'clear'
  | 'code-tags'
  | 'cross'
  | 'devices'
  | 'download'
  | 'favorite'
  | 'forum'
  | 'image'
  | 'image_outline'
  | 'info'
  | 'lead-pencil'
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
  | 'proxy'
  | 'proxy-not-connected'
  | 'rotate-right'
  | 'qr'
  | 'question_mark'
  | 'search'
  | 'reaction'
  | 'sell'
  | 'settings'
  | 'swap_vert'
  | 'swap_hor'
  | 'trash'
  | 'upload-file'
  | 'visibility'

type IconColoring =
  | 'currentColor'
  | 'navbar'
  | 'contextMenu'
  | 'fullscreenControls'
  | 'appearanceSelector'
  | 'remove'

type PropsBase = {
  className?: string
  onClick?: React.MouseEventHandler<HTMLElement>
  icon: IconName
  coloring?: IconColoring
  size?: number
}
type JustIconProps = PropsBase & {
  /** Consider using IconButton instead */
  onClick?: undefined
}
type IconButtonProps = PropsBase &
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    'aria-label': string
    /**
     * `'highlight'` renders a transparent, icon-only button with a rounded
     * background highlight on hover. Used for navbar / toolbar actions
     * (search clear, QR scan, proxy status, app picker search clear, …).
     */
    styling?: 'highlight'
    /**
     * Marks the button with `data-no-drag-region` so it stays clickable when
     * it sits inside a window drag region (e.g. directly in a navbar).
     */
    noDragRegion?: boolean
  }

export default function Icon({
  coloring,
  size = 20,
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
  icon,
  className,
  styling,
  noDragRegion,
  ...rest
}: IconButtonProps) {
  // highlight on hover
  const highlight = styling === 'highlight'
  return (
    <button
      type='button'
      // Buttons inside a window drag region must opt out to stay clickable.
      data-no-drag-region={noDragRegion || undefined}
      {...rest}
      className={classNames(
        styles.iconButton,
        highlight && styles.highlight,
        className
      )}
    >
      <Icon
        coloring={coloring ?? (highlight ? 'currentColor' : undefined)}
        size={size}
        icon={icon}
      />
    </button>
  )
}
