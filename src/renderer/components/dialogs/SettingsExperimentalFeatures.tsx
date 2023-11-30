import React, { useContext } from 'react'

import { ScreenContext, useTranslationFunction } from '../../contexts'
import SettingsStoreInstance, {
  SettingsStoreState,
} from '../../stores/settings'
import SettingsSelector from '../SettingsSelector'
import EditVideochatInstanceDialog from './EditVideochatInstanceDialog'
import { CoreSettingsSwitch, DesktopSettingsSwitch } from '../SettingsSwitch'

export const VIDEO_CHAT_INSTANCE_SYSTEMLI = 'https://meet.systemli.org/$ROOM'
export const VIDEO_CHAT_INSTANCE_AUTISTICI = 'https://vc.autistici.org/$ROOM'

type Props = {
  settingsStore: SettingsStoreState
}

export function SettingsExperimentalFeatures({ settingsStore }: Props) {
  const tx = useTranslationFunction()
  const { openDialog } = useContext(ScreenContext)

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
      <DesktopSettingsSwitch
        key='enableBroadcastLists'
        label={tx('broadcast_lists')}
        description={tx('chat_new_broadcast_hint')}
      />
      <DesktopSettingsSwitch
        key='enableOnDemandLocationStreaming'
        label={tx('pref_on_demand_location_streaming')}
      />
      <DesktopSettingsSwitch
        key='enableChatAuditLog'
        label={tx('menu_chat_audit_log')}
        description={tx('chat_audit_log_description')}
      />
      <DesktopSettingsSwitch
        key='enableRelatedChats'
        label={tx('related_chats')}
      />
      <DesktopSettingsSwitch
        key='experimentalEnableMarkdownInMessages'
        label='Render Markdown in Messages'
      />
      <DesktopSettingsSwitch
        key='enableWebxdcDevTools'
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
      <CoreSettingsSwitch
        label={tx('disable_imap_idle')}
        key='disable_idle'
        description={tx('disable_imap_idle_explain')}
      />
      <SettingsSelector
        onClick={onClickEdit.bind(null)}
        currentValue={showVideochatInstance(
          settingsStore.settings['webrtc_instance']
        )}
      >
        {tx('videochat')}
      </SettingsSelector>
    </>
  )
}
