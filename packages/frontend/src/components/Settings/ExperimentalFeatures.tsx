import React from 'react'

import SettingsStoreInstance, {
  SettingsStoreState,
  useSettingsStore,
} from '../../stores/settings'
import SettingsSelector from './SettingsSelector'
import DesktopSettingsSwitch from './DesktopSettingsSwitch'
import EditVideochatInstanceDialog from '../dialogs/EditVideochatInstanceDialog'
import {
  VIDEO_CHAT_INSTANCE_AUTISTICI,
  VIDEO_CHAT_INSTANCE_SYSTEMLI,
} from '../../../../shared/constants'
import useTranslationFunction from '../../hooks/useTranslationFunction'
import useDialog from '../../hooks/dialog/useDialog'
import SettingsSwitch from './SettingsSwitch'
import { runtime } from '@deltachat-desktop/runtime-interface'

type Props = {
  settingsStore: SettingsStoreState
}

export function ExperimentalFeatures({ settingsStore }: Props) {
  const tx = useTranslationFunction()
  const { openDialog } = useDialog()

  const onClickEdit = async () => {
    openDialog(EditVideochatInstanceDialog, {
      onOk: async (configValue: string) => {
        SettingsStoreInstance.effect.setCoreSetting(
          'webrtc_instance',
          configValue
        )
        if (configValue === '') {
          SettingsStoreInstance.effect.setDesktopSetting('enableAVCalls', false)
        } else {
          SettingsStoreInstance.effect.setDesktopSetting('enableAVCalls', true)
        }
      },
      settingsStore,
    })
  }

  const showVideochatInstance = (instance: string) => {
    if (instance === '') {
      return tx('off')
    } else if (instance === VIDEO_CHAT_INSTANCE_SYSTEMLI) {
      return 'Systemli'
    } else if (instance === VIDEO_CHAT_INSTANCE_AUTISTICI) {
      return 'Autistici'
    }
    return instance
  }

  return (
    <>
      <SettingsSelector
        onClick={onClickEdit.bind(null)}
        currentValue={showVideochatInstance(
          settingsStore.settings['webrtc_instance']
        )}
      >
        {tx('videochat')}
      </SettingsSelector>
      <DesktopSettingsSwitch
        settingsKey='enableBroadcastLists'
        label={tx('broadcast_lists')}
        description={tx('chat_new_broadcast_hint')}
      />
      <DesktopSettingsSwitch
        settingsKey='enableOnDemandLocationStreaming'
        label={tx('pref_on_demand_location_streaming')}
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
