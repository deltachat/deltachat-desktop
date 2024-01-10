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
}

export default function Radio({
  onSelect,
  selected,
  label,
  value,
  className,
  name,
  subtitle,
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
      <label htmlFor={id} className={classNames(!subtitle && 'no-subtitle')}>
        <span>{label}</span>
        {subtitle && <span>{subtitle}</span>}
      </label>
    </div>
  )
}
