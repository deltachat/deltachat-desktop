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
  callback?: (updatedValue: boolean) => void
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
  callback,
}: Props) {
  const settingsStore = useSettingsStore()[0]

  const disabledFinal: boolean = disabled || settingsStore == null
  const value =
    disabledFinal === true && typeof disabledValue !== 'undefined'
      ? disabledValue
      : settingsStore?.settings[settingsKey] === '1'

  return (
    <SettingsSwitch
      label={label}
      value={value}
      description={description}
      onChange={() => {
        if (settingsStore == null) {
          return
        }
        const previousValue = settingsStore.settings[settingsKey] === '1'
        SettingsStoreInstance.effect.setCoreSetting(
          settingsKey,
          flipDeltaBoolean(settingsStore.settings[settingsKey])
        )
        callback?.(!previousValue)
      }}
      disabled={disabledFinal}
    />
  )
}
