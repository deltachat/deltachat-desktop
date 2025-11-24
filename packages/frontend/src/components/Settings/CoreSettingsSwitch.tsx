import React, { useState } from 'react'

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
  /**
   * Called before the setting is changed. Return false to prevent the change.
   * Can be async to show confirmation dialogs.
   */
  beforeChange?: (newValue: boolean) => boolean | Promise<boolean>
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
  beforeChange,
}: Props) {
  const settingsStore = useSettingsStore()[0]
  const [isProcessing, setIsProcessing] = useState(false)

  const disabledFinal: boolean =
    disabled || settingsStore == null || isProcessing

  // Get the actual value from the store
  const storeValue = settingsStore?.settings[settingsKey] === '1'

  const value =
    disabledFinal === true && typeof disabledValue !== 'undefined'
      ? disabledValue
      : storeValue

  const handleChange = async () => {
    if (settingsStore == null || isProcessing) {
      return
    }

    // Call beforeChange hook if provided
    if (beforeChange) {
      setIsProcessing(true)
      try {
        const shouldProceed = await beforeChange(!storeValue)
        setIsProcessing(false)
        if (!shouldProceed) {
          // user cancelled, don't change the setting
          return
        }
      } catch (_error) {
        setIsProcessing(false)
        return
      }
    }

    SettingsStoreInstance.effect.setCoreSetting(
      settingsKey,
      flipDeltaBoolean(settingsStore.settings[settingsKey])
    )
  }

  return (
    <SettingsSwitch
      label={label}
      value={value}
      description={description}
      onChange={handleChange}
      disabled={disabledFinal}
    />
  )
}
