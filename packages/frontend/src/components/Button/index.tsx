import React from 'react'
import classNames from 'classnames'

import styles from './style.module.scss'

type Props = React.PropsWithChildren<{
  'aria-label'?: string
  className?: string
  disabled?: boolean
  active?: boolean
  id?: string
  onClick: any
  styling?: 'minimal'
  // 'transparent' is to wrap other elements and mark those as button
  type?: 'primary' | 'secondary' | 'danger' | 'transparent'
}>

export default function Button({
  children,
  disabled = false,
  active = false,
  id,
  onClick,
  type,
  styling,
  ...props
}: Props) {
  return (
    <button
      id={id}
      disabled={disabled}
      role='button'
      className={classNames(
        styles.button,
        active && styles.active,
        type && styles[type],
        styling && styles[styling],
        props.className
      )}
      onClick={onClick}
      aria-label={props['aria-label']}
    >
      {children}
    </button>
  )
}
