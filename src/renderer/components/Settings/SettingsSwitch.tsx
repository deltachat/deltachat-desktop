import classNames from 'classnames'
import React from 'react'

import styles from './styles.module.scss'
import Switch from '../Switch'

type Props = {
  description?: string
  disabled?: boolean
  label: string
  onClick: () => void
  value: boolean
}

export default function SettingsSwitch({
  description,
  disabled = false,
  label,
  onClick,
  value,
}: Props) {
  return (
    <label
      className={classNames(styles.settingsSwitch, {
        [styles.disabled]: disabled,
      })}
    >
      <div className={styles.settingsSwitchLeft}>
        <span
          className={classNames(styles.settingsSwitchLabel, {
            [styles.disabled]: disabled,
          })}
        >
          {label}
        </span>
        {description && (
          <div
            className={classNames(styles.settingsSwitchDescription, {
              [styles.disabled]: disabled,
            })}
          >
            {description}
          </div>
        )}
      </div>
      <div className={styles.settingsSwitchRight}>
        <Switch checked={value} disabled={disabled} onChange={onClick} />
      </div>
    </label>
  )
}
