import React from 'react'

import { DesktopSettingsType } from '@deltachat-desktop/shared/shared-types'
import {
  DesktopSettingsStoreInstance,
  useDesktopSettingsStore,
} from '../../stores/settings'
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
  const desktopSettingsStore = useDesktopSettingsStore()[0]

  const disabledFinal: boolean = disabled || desktopSettingsStore == null
  const value =
    disabledFinal === true && typeof disabledValue !== 'undefined'
      ? disabledValue
      : desktopSettingsStore?.[settingsKey] === true

  return (
    <SettingsSwitch
      label={label}
      description={description}
      value={value}
      onChange={async () => {
        if (desktopSettingsStore == null) {
          return
        }
        const newValue = !desktopSettingsStore[settingsKey]
        await DesktopSettingsStoreInstance.effect.set(settingsKey, newValue)
        callback?.(newValue)
      }}
      disabled={disabledFinal}
    />
  )
}
