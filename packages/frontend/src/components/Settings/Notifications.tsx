import React from 'react'

import { DesktopSettingsType } from '../../../../shared/shared-types'
import useTranslationFunction from '../../hooks/useTranslationFunction'
import DesktopSettingsSwitch from './DesktopSettingsSwitch'
import SettingsSeparator from './SettingsSeparator'
import AccountNotificationStoreInstance, {
  useAccountNotificationStore,
} from '../../stores/accountNotifications'
import { selectedAccountId } from '../../ScreenController'
import SettingsSwitch from './SettingsSwitch'
import SettingsHeading from './SettingsHeading'
import SettingsSelector from './SettingsSelector'
import SmallSelectDialog from '../SmallSelectDialog'
import SettingsStoreInstance, {
  useSettingsStore,
  WhoCanCallMe,
} from '../../stores/settings'
import useDialog from '../../hooks/dialog/useDialog'
import CoreSettingsSwitch from './CoreSettingsSwitch'
import { runtime } from '@deltachat-desktop/runtime-interface'

type Props = {
  desktopSettings: DesktopSettingsType
}

export default function Notifications({ desktopSettings }: Props) {
  const tx = useTranslationFunction()
  const settingsStore = useSettingsStore()[0]
  const accountId = selectedAccountId()
  const { accounts } = useAccountNotificationStore()[0]!
  const isMuted = accounts[accountId]?.muted || false

  const inChatSoundsVolumeOptions: Parameters<
    typeof SmallSelectDialog
  >[0]['values'] = [
    ['0', tx('muted')],
    ['0.1', '10%'],
    ['0.2', '20%'],
    ['0.3', '30%'],
    ['0.4', '40%'],
    ['0.5', '50%'],
    ['0.6', '60%'],
    ['0.7', '70%'],
    ['0.8', '80%'],
    ['0.9', '90%'],
    ['1', '100%'],
  ]
  const volumeNumberToString = (volume: number) => {
    if (volume === 0) {
      return tx('muted')
    }
    return volume * 100 + '%'
  }

  const { openDialog } = useDialog()
  const onOpenInChatSoundsVolumeDialog = async () => {
    openDialog(SmallSelectDialog, {
      values: inChatSoundsVolumeOptions,
      initialSelectedValue: desktopSettings.inChatSoundsVolume.toString(10),
      title: tx('pref_in_chat_sounds'),
      onSave: async (volume_: string) => {
        const volume = Number(volume_)
        SettingsStoreInstance.effect.setDesktopSetting(
          'inChatSoundsVolume',
          volume
        )
      },
    })
  }

  return (
    <>
      <SettingsSwitch
        label={tx('menu_mute')}
        value={isMuted}
        disabled={!desktopSettings['notifications']}
        onChange={() => {
          AccountNotificationStoreInstance.effect.setMuted(accountId, !isMuted)
        }}
      />
      <CoreSettingsSwitch
        settingsKey='ui.mentions_enabled'
        label={tx('pref_mention_notifications')}
        description={tx('pref_mention_notifications_explain')}
        disabled={isMuted || !desktopSettings['notifications']}
        disabledValue={false}
      />
      {runtime.getRuntimeInfo().target === 'electron' && (
        // Calls are only implemented on Electron.
        // https://github.com/deltachat/deltachat-desktop/pull/6044#issuecomment-3977395069
        <SettingsSwitch
          label={tx('pref_calls')}
          description={tx('pref_calls_explain')}
          value={
            settingsStore?.settings.who_can_call_me !== WhoCanCallMe.Nobody
          }
          disabled={settingsStore == undefined}
          onChange={async (val: boolean) => {
            await SettingsStoreInstance.effect.setCoreSetting(
              'who_can_call_me',
              val ? WhoCanCallMe.Contacts : WhoCanCallMe.Nobody
            )
          }}
        />
      )}
      <SettingsSeparator></SettingsSeparator>
      <SettingsSelector
        onClick={onOpenInChatSoundsVolumeDialog.bind(null)}
        currentValue={volumeNumberToString(desktopSettings.inChatSoundsVolume)}
      >
        {tx('pref_in_chat_sounds')}
      </SettingsSelector>
      <DesktopSettingsSwitch
        settingsKey='showNotificationContent'
        label={tx('pref_show_notification_content')}
        disabled={!desktopSettings['notifications']}
      />
      <DesktopSettingsSwitch
        settingsKey='notifications'
        label={tx('pref_notifications_explain')}
      />
    </>
  )
}
