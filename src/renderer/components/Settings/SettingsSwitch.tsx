import React from 'react'
import classNames from 'classnames'

import Switch from '../Switch'

import styles from './styles.module.scss'

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
        <span>{label}</span>
        {description && (
          <div className={styles.settingsSwitchDescription}>{description}</div>
        )}
      </div>
      <div className={styles.settingsSwitchRight}>
        <Switch checked={value} disabled={disabled} onChange={onClick} />
      </div>
    </label>
  )
}
