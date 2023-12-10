import React from 'react'
import classNames from 'classnames'


type ButtonProps = {
  children: any
  onClick?: () => void
  className?: any
  style?: Record<string, string | number>
}

export default function Button({ onClick, children, className, style }: ButtonProps) {
  return (
    <p
      className={classNames('delta-button primary bold', className)}
      onClick={onClick}
      {...style}
    >
      {children}
    </p>
  )
}
