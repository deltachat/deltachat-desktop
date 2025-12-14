import React, { useId } from 'react'
import classNames from 'classnames'

type RadioProps = {
  onSelect?: () => void
  selected?: boolean
  label: string
  value: string
  className?: string
  name?: string
  /**
   * If not omitted, and if it's an empty string, the height of the radio
   * will be the same as if the subtitle was present.
   * Otherwise only the {@link RadioProps.label} height will define the height.
   */
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
  const id: string = useId()
  return (
    <div className={classNames('radiobutton', className)}>
      <input
        id={id}
        name={name}
        type='radio'
        // > change event fires
        // > When a <input type="radio"> element is checked
        // > (but not when unchecked);
        onChange={() => onSelect && onSelect()}
        value={value}
        checked={Boolean(selected)}
      />
      <label
        htmlFor={id}
        className={classNames({
          'subtitle-height': subtitle != undefined,
          'no-subtitle': subtitle == undefined || subtitle === '',
        })}
      >
        <span>{label}</span>
        {subtitle && <span>{subtitle}</span>}
      </label>
    </div>
  )
}
