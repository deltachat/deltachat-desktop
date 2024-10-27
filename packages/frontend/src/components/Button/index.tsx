import React from 'react'
import classNames from 'classnames'

import styles from './style.module.scss'

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  active?: boolean
  styling?: 'primary' | 'secondary' | 'danger'
  dataTestid?: string
}

export default function Button({
  children,
  active = false,
  styling,
  className,
  dataTestid,
  ...props
}: ButtonProps) {
  return (
    <button
      className={classNames(
        styles.button,
        active && styles.active,
        styling && styles[styling],
        className
      )}
      data-testid={dataTestid}
      {...props}
    >
      {children}
    </button>
  )
}
