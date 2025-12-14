import React from 'react'

import { DesktopSettingsType } from '../../../../shared/shared-types'
import SettingsStoreInstance, { useSettingsStore } from '../../stores/settings'
import SettingsSwitch from './SettingsSwitch'

type Props = {
  settingsKey: keyof DesktopSettingsType
  label: string
  description?: string
  disabled?: boolean
  disabledValue?: boolean
  callback?: (updatedValue: boolean) => void
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
  callback,
}: Props) {
  const settingsStore = useSettingsStore()[0]

  const disabledFinal: boolean = disabled || settingsStore == null
  const value =
    disabledFinal === true && typeof disabledValue !== 'undefined'
      ? disabledValue
      : settingsStore?.desktopSettings[settingsKey] === true

  return (
    <SettingsSwitch
      label={label}
      description={description}
      value={value}
      onChange={async () => {
        if (settingsStore == null) {
          return
        }
        const newValue = !settingsStore.desktopSettings[settingsKey]
        await SettingsStoreInstance.effect.setDesktopSetting(
          settingsKey,
          newValue
        )
        callback?.(newValue)
      }}
      disabled={disabledFinal}
    />
  )
}
