import React from 'react'
import classNames from 'classnames'

type ButtonProps = {
  children: any
  onClick?: any
  className?: any
  style?: Record<string, string | number>
  type?: 'primary' | 'danger' | 'secondary'
  round?: boolean
  id?: string
  'aria-label'?: string
  disabled?: boolean
}

export default function Button({
  disabled,
  id,
  round,
  onClick,
  children,
  className,
  style,
  type,
}: ButtonProps) {
  return (
    <button
      id={id}
      className={classNames(
        'delta-button' + (round ? '-round' : ''),
        'bold',
        className,
        type,
      )}
      onClick={onClick}
      style={style}
      role='button'
      disabled={disabled}
    >
      {children}
    </button>
  )
}
