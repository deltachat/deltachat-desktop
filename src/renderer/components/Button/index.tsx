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
  className?: any
}>

export default function Button({
  children,
  className,
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
        round ? styles.deltaButtonRound : styles.deltaButton,
        styles.bold,
        type && styles[type],
        className
      )}
      onClick={onClick}
      aria-label={props['aria-label']}
    >
      {children}
    </button>
  )
}
