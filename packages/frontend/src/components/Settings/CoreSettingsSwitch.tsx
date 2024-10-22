import React from 'react'

import SettingsStoreInstance, {
  SettingsStoreState,
  useSettingsStore,
} from '../../stores/settings'
import SettingsSwitch from './SettingsSwitch'

function flipDeltaBoolean(value: string) {
  return value === '1' ? '0' : '1'
}

type Props = {
  settingsKey: keyof SettingsStoreState['settings']
  label: string
  description?: string
  disabled?: boolean
  disabledValue?: boolean
}

/*
 * Switch for Core Settings
 */
export default function CoreSettingsSwitch({
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
      : settingsStore.settings[settingsKey] === '1'

  return (
    <SettingsSwitch
      label={label}
      value={value}
      description={description}
      onChange={() => {
        SettingsStoreInstance.effect.setCoreSetting(
          settingsKey,
          flipDeltaBoolean(settingsStore.settings[settingsKey])
        )
      }}
      disabled={disabled}
    />
  )
}
