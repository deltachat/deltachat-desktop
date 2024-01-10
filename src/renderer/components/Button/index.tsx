import React from 'react'
import classNames from 'classnames'
import styles from './style.module.scss'

type ButtonProps = React.PropsWithChildren<{
  type?: 'secondary' | 'primary' | 'danger'
  onClick: any
  round?: boolean
  id?: string
  'aria-label'?: string
  disabled?: boolean
}>

export default function Button({
  children,
  disabled,
  type,
  round,
  onClick,
  id,
  ...props
}: ButtonProps) {
  return (
    <button
      id={id}
      disabled={!!disabled}
      role='button'
      className={classNames(
        styles.deltaButton,
        round && styles.round,
        type && styles[type],
      )}
      onClick={onClick}
      aria-label={props['aria-label']}
    >
      {children}
    </button>
  )
}
