import React from 'react'
import classNames from 'classnames'

import styles from './style.module.scss'

type Props = React.PropsWithChildren<{
  'aria-label'?: string
  className?: string
  disabled?: boolean
  id?: string
  onClick: any
  type?: 'primary' | 'secondary' | 'danger'
}>

export default function Button({
  children,
  disabled = false,
  id,
  onClick,
  type,
  ...props
}: Props) {
  return (
    <button
      id={id}
      disabled={disabled}
      role='button'
      className={classNames(
        styles.button,
        type && styles[type],
        props.className
      )}
      onClick={onClick}
      aria-label={props['aria-label']}
    >
      {children}
    </button>
  )
}
