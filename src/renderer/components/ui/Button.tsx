import React from 'react'
import classNames from 'classnames'

type ButtonProps = React.PropsWithChildren<{
  type: 'secondary' | 'primary' | 'danger'
  onClick: any
  round?: boolean
  id?: string
  style?: any
  'aria-label'?: string
  disabled?: boolean
  className?: any
}>

export default function Button({ children, className, disabled, type, round, onClick, style, id, ...props}: ButtonProps) {
  return (
    <button
      id={id}
      disabled={!!disabled}
      role='button'
      className={classNames('delta-button' + (round ? '-round': ''), 'bold', type, className)}
      onClick={onClick}
      style={style}
      aria-label={props['aria-label']}
      >
        {children}
      </button>
      )
}
