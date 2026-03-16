import React from 'react'
import classNames from 'classnames'

import Switch from '../Switch'

import styles from './styles.module.scss'

type Props = {
  description?: string
  disabled?: boolean
  label: string
  onChange: (val: boolean) => void
  value: boolean
}

export default function SettingsSwitch({
  description,
  disabled = false,
  label,
  onChange,
  value,
}: Props) {
  return (
    <label
      className={classNames(styles.settingsRow, {
        [styles.disabled]: disabled,
      })}
    >
      <div className={styles.settingsRowLeft}>
        <span
          className={classNames(styles.settingsRowLabel, {
            [styles.disabled]: disabled,
          })}
        >
          {label}
        </span>
        {description && (
          <div
            className={classNames(styles.settingsRowDescription, {
              [styles.disabled]: disabled,
            })}
          >
            {description}
          </div>
        )}
      </div>
      <div className={styles.settingsRowRight}>
        <Switch checked={value} disabled={disabled} onChange={onChange} />
      </div>
    </label>
  )
}
