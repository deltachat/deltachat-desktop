import React from 'react'

import { DesktopSettingsType } from '../../../shared/shared-types'
import { DesktopSettingsSwitch } from '../SettingsSwitch'
import { useTranslationFunction } from '../../contexts'

type Props = {
  desktopSettings: DesktopSettingsType
}

export default function SettingsNotifications({ desktopSettings }: Props) {
  const tx = useTranslationFunction()

  return (
    <>
      <DesktopSettingsSwitch
        key='notifications'
        label={tx('pref_notifications_explain')}
      />
      <DesktopSettingsSwitch
        key='showNotificationContent'
        label={tx('pref_show_notification_content_explain')}
        disabled={!desktopSettings['notifications']}
      />
    </>
  )
}
