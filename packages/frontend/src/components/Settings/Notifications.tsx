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

type Props = {
  desktopSettings: DesktopSettingsType
}

export default function Notifications({ desktopSettings }: Props) {
  const tx = useTranslationFunction()
  const accountId = selectedAccountId()
  const { accounts } = useAccountNotificationStore()[0]!
  const isMuted = accounts[accountId]?.muted || false

  return (
    <>
      <SettingsHeading>{tx('pref_all_accounts')}</SettingsHeading>
      <DesktopSettingsSwitch
        settingsKey='notifications'
        label={tx('pref_notifications_explain')}
      />
      <DesktopSettingsSwitch
        settingsKey='showNotificationContent'
        label={tx('pref_show_notification_content_explain')}
        disabled={!desktopSettings['notifications']}
      />
      <SettingsSeparator></SettingsSeparator>
      <SettingsHeading>{tx('pref_current_account')}</SettingsHeading>
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
      />
    </>
  )
}
