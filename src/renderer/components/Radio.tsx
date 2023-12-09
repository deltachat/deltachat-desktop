import React from 'react'
import classNames from 'classnames'

type RadioProps = {
  onSelect?: () => void
  selected?: boolean
  label: string
  value: string
  className?: string
  name?: string
  subtitle?: string
  icon?: string
  iconStyle?: any
}

export default function Radio({
  onSelect,
  selected,
  label,
  value,
  className,
  name,
  subtitle,
  icon,
  iconStyle,
}: RadioProps) {
  const id: string = Math.floor(Math.random() * 10000).toString()
  return (
    <div className={classNames('radiobutton', className)}>
      <input
        id={id}
        name={name}
        type='radio'
        onClick={() => onSelect && onSelect()}
        value={value}
        defaultChecked={Boolean(selected)}
      />
      {icon && <img src={icon} style={iconStyle} />}
      <label htmlFor={id} className={classNames(!subtitle && 'no-subtitle')}>
        <span>{label}</span>
        {subtitle && <span>{subtitle}</span>}
      </label>
    </div>
  )
}
