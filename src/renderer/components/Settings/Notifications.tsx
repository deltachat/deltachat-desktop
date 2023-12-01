import React from 'react'

import { DesktopSettingsType } from '../../../shared/shared-types'
import { useTranslationFunction } from '../../contexts'
import DesktopSettingsSwitch from './DesktopSettingsSwitch'

type Props = {
  desktopSettings: DesktopSettingsType
}

export default function Notifications({ desktopSettings }: Props) {
  const tx = useTranslationFunction()

  return (
    <>
      <DesktopSettingsSwitch
        settingsKey='notifications'
        label={tx('pref_notifications_explain')}
      />
      <DesktopSettingsSwitch
        settingsKey='showNotificationContent'
        label={tx('pref_show_notification_content_explain')}
        disabled={!desktopSettings['notifications']}
      />
    </>
  )
}
