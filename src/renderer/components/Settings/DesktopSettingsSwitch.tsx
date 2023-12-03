import React from 'react'

import { DesktopSettingsType } from '../../../shared/shared-types'
import SettingsStoreInstance, { useSettingsStore } from '../../stores/settings'
import SettingsSwitch from './SettingsSwitch'

type Props = {
  settingsKey: keyof DesktopSettingsType
  label: string
  description?: string
  disabled?: boolean
  disabledValue?: boolean
}

/*
 * Switch for Desktop Settings
 */
export default function DesktopSettingsSwitch({
  settingsKey,
  label,
  description,
  disabled,
  disabledValue,
}: Props) {
  const settingsStore = useSettingsStore()[0]!

  const value =
    disabled === true && typeof disabledValue !== 'undefined'
      ? disabledValue
      : settingsStore.desktopSettings[settingsKey] === true

  return (
    <SettingsSwitch
      label={label}
      description={description}
      value={value}
      onClick={() => {
        SettingsStoreInstance.effect.setDesktopSetting(
          settingsKey,
          !settingsStore.desktopSettings[settingsKey]
        )
      }}
      disabled={disabled}
    />
  )
}
