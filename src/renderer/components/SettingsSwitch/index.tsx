import React from 'react'

import { DesktopSettingsType } from '../../../shared/shared-types'
import SettingsStoreInstance, {
  SettingsStoreState,
  useSettingsStore,
} from '../../stores/settings'
import { DeltaSwitch2 } from '../dialogs/DeltaDialog'

function flipDeltaBoolean(value: string) {
  return value === '1' ? '0' : '1'
}

export type RenderDTSettingSwitchType = ({
  key,
  label,
  description,
  disabled,
  disabledValue,
}: {
  key: keyof DesktopSettingsType
  label: string
  description?: string
  disabled?: boolean
  disabledValue?: boolean
}) => JSX.Element | null

export type RenderDeltaSwitch2Type = ({
  key,
  label,
  description,
  disabled,
  disabledValue,
}: {
  key: keyof SettingsStoreState['settings']
  label: string
  description?: string
  disabled?: boolean
  disabledValue?: boolean
}) => void

/*
 * Switch for Desktop Settings
 */
export function DesktopSettingsSwitch({
  key,
  label,
  description,
  disabled,
  disabledValue,
}: {
  key: keyof DesktopSettingsType
  label: string
  description?: string
  disabled?: boolean
  disabledValue?: boolean
}) {
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

/*
 * Switch for Core Settings
 */
export function CoreSettingsSwitch({
  key,
  label,
  description,
  disabled,
  disabledValue,
}: {
  key: keyof SettingsStoreState['settings']
  label: string
  description?: string
  disabled?: boolean
  disabledValue?: boolean
}) {
  const settingsStore = useSettingsStore()[0]!

  const value =
    disabled === true && typeof disabledValue !== 'undefined'
      ? disabledValue
      : settingsStore.settings[key] === '1'

  return (
    <DeltaSwitch2
      label={label}
      value={value}
      description={description}
      onClick={() => {
        SettingsStoreInstance.effect.setCoreSetting(
          key,
          flipDeltaBoolean(settingsStore.settings[key])
        )
      }}
      disabled={disabled}
    />
  )
}
