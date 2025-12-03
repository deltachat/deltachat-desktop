import React from 'react'
import classNames from 'classnames'

import styles from './style.module.scss'

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  active?: boolean
  // borderless means button element has no border and transparent background
  // and is of type button for accessibility reasons
  styling?: 'primary' | 'danger' | 'borderless'
  type?: 'button' | 'submit' | 'reset'
}

export default function Button({
  children,
  active = false,
  styling,
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      // eslint-disable-next-line react/button-has-type
      type={props.type || 'button'}
      className={classNames(
        styles.button,
        active && styles.active,
        styling && styles[styling],
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}
