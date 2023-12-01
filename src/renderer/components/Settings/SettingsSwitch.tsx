import React from 'react'
import classNames from 'classnames'

type Props = {
  label: string
  value: boolean
  description?: string
  onClick: () => void
  disabled?: boolean
}

export default function SettingsSwitch({
  label,
  description,
  value,
  onClick,
  disabled,
}: Props) {
  disabled = disabled === true ? true : false

  return (
    <label className={classNames('DialogSwitch', { disabled })}>
      <div className='left'>
        <div className='label'>{label}</div>
        {description && <div className='description'>{description}</div>}
      </div>
      <div className='right'>
        <label className='delta-switch2 bp4-switch bp4-align-right inactive'>
          <input
            type='checkbox'
            checked={value}
            onClick={() => {
              disabled === false && onClick()
            }}
            readOnly
          />
          <span
            className={classNames('delta-switch2-indicator', {
              checked: value,
              disabled,
            })}
          />
        </label>
      </div>
    </label>
  )
}
