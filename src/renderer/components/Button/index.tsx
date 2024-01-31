import React from 'react'
import classNames from 'classnames'
import styles from './style.module.scss'

type ButtonProps = React.PropsWithChildren<{
  'aria-label'?: string
  disabled?: boolean
  id?: string
  onClick: any
  round?: boolean
  type?: 'secondary' | 'primary' | 'danger'
}>

export default function Button({
  children,
  disabled = false,
  id,
  onClick,
  round = false,
  type,
  ...props
}: ButtonProps) {
  return (
    <button
      id={id}
      disabled={disabled}
      role='button'
      className={classNames(
        styles.button,
        round && styles.round,
        type && styles[type]
      )}
      onClick={onClick}
      aria-label={props['aria-label']}
    >
      {children}
    </button>
  )
}
