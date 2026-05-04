import React from 'react'

import SettingsStoreInstance, {
  useSettingsStore,
  type SettingsStoreState,
} from '../../stores/settings'
import DesktopSettingsSwitch from './DesktopSettingsSwitch'
import useTranslationFunction from '../../hooks/useTranslationFunction'
import SettingsSwitch from './SettingsSwitch'
import { runtime } from '@deltachat-desktop/runtime-interface'
import useDialog from '../../hooks/dialog/useDialog'
import AlertDialog from '../dialogs/AlertDialog'

export function ExperimentalFeatures() {
  const tx = useTranslationFunction()
  const { openDialog } = useDialog()

  const showExperimentalInfoDialog = async (
    settingsKey: keyof Pick<
      SettingsStoreState['desktopSettings'],
      'enableOnDemandLocationStreaming'
    >,
    updatedValue: boolean
  ) => {
    if (!updatedValue) {
      return
    }
    let message: string
    // The strings are copy-pasted from
    // https://github.com/deltachat/deltachat-android/blob/2385b236c7ed9eb0e26ef819d8274936877b7023/src/main/java/org/thoughtcrime/securesms/preferences/AdvancedPreferenceFragment.java

    switch (settingsKey) {
      case 'enableOnDemandLocationStreaming':
        message =
          'Thanks for trying out "On-Demand Location Streaming"\n\n' +
          '• If enabled you will find a map icon above the message list, which opens a map with shared locations of your contacts' +
          '\n\n• Sharing your own location is only available in mobile clients'
        break
    }

    message +=
      '\n\n• If you want to quit the experimental feature, you can disable it at "Settings / Advanced"'
    openDialog(AlertDialog, {
      message,
      confirmLabel: tx('ok'),
    })
  }

  return (
    <>
      <DesktopSettingsSwitch
        settingsKey='enableOnDemandLocationStreaming'
        label={tx('pref_on_demand_location_streaming')}
        callback={value =>
          showExperimentalInfoDialog('enableOnDemandLocationStreaming', value)
        }
      />
      {runtime.getRuntimeInfo().isContentProtectionSupported && (
        <DesktopSettingsSwitch
          settingsKey='contentProtectionEnabled'
          label={tx('pref_screen_security')}
          description={tx('pref_screen_security_explain')}
        />
      )}
      <SyncAllAccountsSwitch />
      <DesktopSettingsSwitch
        settingsKey='enableWebxdcDevTools'
        label='Enable Webxdc Devtools'
        // See https://delta.chat/en/2023-05-22-webxdc-security,
        // "XDC-01-004 WP1: Data exfiltration via desktop app DevTools"
        //
        // Although thanks to another hardening measure this shouldn't be
        // easy to pull off. Namely, direct internet access is sort of
        // disabled for the Electron part of the app:
        // 853b584251a5dacf60ebc616f7fb10edffb5c5e5/src/main/index.ts#L12-L21
        description='Careful: opening developer tools on a malicious webxdc app could lead to the app getting access to the Internet'
      />
    </>
  )
}

export default function SyncAllAccountsSwitch() {
  const tx = useTranslationFunction()
  const settingsStore = useSettingsStore()[0]

  return (
    <SettingsSwitch
      label={tx('pref_background_sync_disabled')}
      description={tx('explain_background_sync_disabled')}
      value={settingsStore?.desktopSettings.syncAllAccounts !== true}
      disabled={settingsStore == null}
      onChange={() => {
        if (settingsStore == null) {
          return
        }
        SettingsStoreInstance.effect.setDesktopSetting(
          'syncAllAccounts',
          !settingsStore.desktopSettings.syncAllAccounts
        )
      }}
    />
  )
}
