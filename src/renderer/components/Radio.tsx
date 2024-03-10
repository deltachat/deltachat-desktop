import React from 'react'
import classNames from 'classnames'

export type RadioProps = {
  onSelect?: () => void
  selected?: boolean
  label: string
  value: string
  className?: string
  name?: string
  subtitle?: string
  icon?: string
  iconRound?: boolean
  iconSize?: string | number
  iconWithBackground?: boolean
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
  iconRound,
  iconSize,
  iconWithBackground,
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
      {icon && (
        <img
          style={{
            width: iconSize,
            height: iconSize,
            margin: '4px',
            borderRadius: iconRound ? '4px' : undefined,
            backgroundColor: iconWithBackground
              ? 'var(--textPrimary)'
              : undefined,
          }}
          src={icon}
        />
      )}
      <label htmlFor={id} className={classNames(!subtitle && 'no-subtitle')}>
        <span>{label}</span>
        {subtitle && <span>{subtitle}</span>}
      </label>
    </div>
  )
}
