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
import SettingsStoreInstance, { useSettingsStore } from '../../stores/settings'
import useDialog from '../../hooks/dialog/useDialog'
import { getLogger } from '@deltachat-desktop/shared/logger'

const log = getLogger('Settings/Notifications.tsx')

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
  const whoCanCallMeOptions = [
    ['0', tx('who_can_call_me_everybody')],
    ['1', tx('who_can_call_me_contacts')],
    ['2', tx('who_can_call_me_nobody')],
  ] satisfies Parameters<typeof SmallSelectDialog>[0]['values']
  const whoCanCallMeValToString = (
    val: NonNullable<typeof settingsStore>['settings']['who_can_call_me']
  ) => whoCanCallMeOptions.find(([v]) => val === v)?.[1] ?? val
  const onOpenWhoCanCallMeDialog = async () => {
    if (settingsStore == null) {
      log.warn("settingsStore not loaded yet, can't open dialog")
      return
    }
    openDialog(SmallSelectDialog, {
      values: whoCanCallMeOptions,
      initialSelectedValue: settingsStore.settings.who_can_call_me,
      title: tx('who_can_call_me'),
      onSave: async (val: string) => {
        await SettingsStoreInstance.effect.setCoreSetting(
          'who_can_call_me',
          val
        )
      },
    })
  }

  return (
    <>
      <SettingsHeading>{tx('all_profiles')}</SettingsHeading>
      <DesktopSettingsSwitch
        settingsKey='notifications'
        label={tx('pref_notifications_explain')}
      />
      <DesktopSettingsSwitch
        settingsKey='showNotificationContent'
        label={tx('pref_show_notification_content_explain')}
        disabled={!desktopSettings['notifications']}
      />
      <SettingsSelector
        onClick={onOpenInChatSoundsVolumeDialog.bind(null)}
        currentValue={volumeNumberToString(desktopSettings.inChatSoundsVolume)}
      >
        {tx('pref_in_chat_sounds')}
      </SettingsSelector>
      <SettingsSeparator></SettingsSeparator>
      <SettingsHeading>{tx('current_profile')}</SettingsHeading>
      {desktopSettings.enableAVCallsV2 && (
        <SettingsSelector
          onClick={onOpenWhoCanCallMeDialog}
          currentValue={
            settingsStore
              ? whoCanCallMeValToString(settingsStore.settings.who_can_call_me)
              : undefined
          }
        >
          {tx('who_can_call_me')}
        </SettingsSelector>
      )}
      <SettingsSwitch
        label={tx('menu_mute')}
        value={isMuted}
        disabled={!desktopSettings['notifications']}
        onChange={() => {
          AccountNotificationStoreInstance.effect.setMuted(accountId, !isMuted)
        }}
      />
      <DesktopSettingsSwitch
        settingsKey='isMentionsEnabled'
        label={tx('pref_mention_notifications')}
        description={tx('pref_mention_notifications_explain')}
        disabled={isMuted || !desktopSettings['notifications']}
        disabledValue={false}
      />
    </>
  )
}
