import React from 'react'
import { RenderDTSettingSwitchType } from './Settings'
import { DesktopSettingsType } from '../../../shared/shared-types'

export default function SettingsNotifications({
  desktopSettings,
  renderDTSettingSwitch,
}: {
  desktopSettings: DesktopSettingsType
  renderDTSettingSwitch: RenderDTSettingSwitchType
}) {
  const tx = window.static_translate
  return (
    <>
      {renderDTSettingSwitch({
        key: 'notifications',
        label: tx('pref_notifications_explain'),
      })}
      {renderDTSettingSwitch({
        key: 'showNotificationContent',
        label: tx('pref_show_notification_content_explain'),
        disabled: !desktopSettings['notifications'],
      })}
    </>
  )
}
