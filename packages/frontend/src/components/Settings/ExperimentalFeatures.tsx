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
import ConfirmationDialog from '../dialogs/ConfirmationDialog'

export function ExperimentalFeatures() {
  const tx = useTranslationFunction()
  const { openDialog } = useDialog()

  const showExperimentalInfoDialog = async (
    settingsKey: keyof SettingsStoreState['desktopSettings'],
    updatedValue: boolean
  ) => {
    if (!updatedValue) {
      return
    }
    let header = ''
    let message = ''
    if (settingsKey === 'enableAVCallsV2') {
      header = 'Thanks for helping to debug "Calls"!'
      message =
        '• You can now debug calls using the "phone" icon in one-to-one-chats' +
        "\n\n• The experiment is about making decentralised calls work and reliable at all, not about options or UI. We're happy about focused feedback at support.delta.chat"
    } else if (settingsKey === 'enableBroadcastLists') {
      header = 'Thanks for trying out "Channels"'
      message = '• You can now create "Channels" from the "New Chat" dialog'
    } else if (settingsKey === 'enableOnDemandLocationStreaming') {
      header = 'Thanks for trying out "On-Demand Location Streaming"'
      message =
        '• If enabled you will find a map icon above the message list, which opens a map with shared locations of your contacts' +
        '\n\n• Sharing your own location is only available in mobile clients'
    }
    message +=
      '\n\n• If you want to quit the experimental feature, you can disable it at "Settings / Advanced"'
    openDialog(ConfirmationDialog, {
      header,
      message,
      confirmLabel: tx('ok'),
      cb: () => {},
    })
  }

  return (
    <>
      {runtime.getRuntimeInfo().target === 'electron' && (
        <DesktopSettingsSwitch
          settingsKey='enableAVCallsV2'
          label={'Debug Calls'}
          description='Work in progress…'
          callback={value =>
            showExperimentalInfoDialog('enableAVCallsV2', value)
          }
        />
      )}
      <DesktopSettingsSwitch
        settingsKey='enableBroadcastLists'
        label={tx('channels')}
        description={tx('chat_new_channel_hint')}
        callback={value =>
          showExperimentalInfoDialog('enableBroadcastLists', value)
        }
      />
      <DesktopSettingsSwitch
        settingsKey='enableOnDemandLocationStreaming'
        label={tx('pref_on_demand_location_streaming')}
        callback={value =>
          showExperimentalInfoDialog('enableOnDemandLocationStreaming', value)
        }
      />
      <DesktopSettingsSwitch
        settingsKey='enableChatAuditLog'
        label={tx('menu_chat_audit_log')}
        description={tx('chat_audit_log_description')}
      />
      <DesktopSettingsSwitch
        settingsKey='enableRelatedChats'
        label={tx('related_chats')}
      />
      <DesktopSettingsSwitch
        settingsKey='experimentalEnableMarkdownInMessages'
        label='Render Markdown in Messages'
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
  const settingsStore = useSettingsStore()[0]!

  return (
    <SettingsSwitch
      label={tx('pref_background_sync_disabled')}
      description={tx('explain_background_sync_disabled')}
      value={settingsStore.desktopSettings.syncAllAccounts !== true}
      onChange={() => {
        SettingsStoreInstance.effect.setDesktopSetting(
          'syncAllAccounts',
          !settingsStore.desktopSettings.syncAllAccounts
        )
      }}
    />
  )
}
