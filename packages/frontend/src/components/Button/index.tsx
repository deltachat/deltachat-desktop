import React from 'react'
import classNames from 'classnames'

import styles from './style.module.scss'

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  active?: boolean
  styling?: 'primary' | 'secondary' | 'danger'
}

export default function Button({
  children,
  active = false,
  type,
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      className={classNames(
        styles.button,
        active && styles.active,
        type && styles[type],
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}
