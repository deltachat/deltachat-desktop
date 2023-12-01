import React from 'react'

import { DesktopSettingsType } from '../../../shared/shared-types'
import SettingsStoreInstance, { useSettingsStore } from '../../stores/settings'
import { DeltaSwitch2 } from '../dialogs/DeltaDialog'

type Props = {
  key: keyof DesktopSettingsType
  label: string
  description?: string
  disabled?: boolean
  disabledValue?: boolean
}

/*
 * Switch for Desktop Settings
 */
export default function DesktopSettingsSwitch({
  key,
  label,
  description,
  disabled,
  disabledValue,
}: Props) {
  const settingsStore = useSettingsStore()[0]!

  const value =
    disabled === true && typeof disabledValue !== 'undefined'
      ? disabledValue
      : settingsStore.desktopSettings[key] === true

  return (
    <DeltaSwitch2
      label={label}
      description={description}
      value={value}
      onClick={() => {
        SettingsStoreInstance.effect.setDesktopSetting(
          key,
          !settingsStore.desktopSettings[key]
        )
      }}
      disabled={disabled}
    />
  )
}
