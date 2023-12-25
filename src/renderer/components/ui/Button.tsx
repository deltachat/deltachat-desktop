import React from 'react'
import classNames from 'classnames'

type ButtonProps = React.PropsWithChildren<{
  type?: 'secondary' | 'primary' | 'danger'
  onClick: any
  round?: boolean
  id?: string
  'aria-label'?: string
  disabled?: boolean
  className?: any
}>

export default function Button({ children, className, disabled, type, round, onClick, id, ...props}: ButtonProps) {
  return (
    <button
      id={id}
      disabled={!!disabled}
      role='button'
      className={classNames('delta-button' + (round ? '-round': ''), 'bold', type, className)}
      onClick={onClick}
      aria-label={props['aria-label']}
      >
        {children}
      </button>
      )
}
