import React, { useEffect, useRef } from 'react'
import classNames from 'classnames'

import styles from './style.module.scss'

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  active?: boolean
  // borderless means button element has no border and transparent background
  // and is of type button for accessibility reasons
  styling?: 'primary' | 'danger' | 'borderless'
  // automatically focus this button when it mounts
  setAutoFocus?: boolean
}

export default function Button({
  children,
  active = false,
  styling,
  className,
  setAutoFocus = false,
  ...props
}: ButtonProps) {
  const buttonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (setAutoFocus && buttonRef.current) {
      // Use requestAnimationFrame to ensure the button is fully rendered
      let cancelled = false
      requestAnimationFrame(() => {
        if (!cancelled) {
          buttonRef.current?.focus()
        }
      })
      return () => {
        cancelled = true
      }
    }
  }, [setAutoFocus])

  return (
    <button
      ref={buttonRef}
      type='button'
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
