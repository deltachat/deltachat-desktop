import { H5 } from "@blueprintjs/core"
import React from "react"
import { DesktopSettingsType } from "../../../shared/shared-types"
import { RenderDeltaSwitch2Type, RenderDTSettingSwitchType, SettingsState } from "./Settings"
import SettingsAutodelete from "./Settings-Autodelete"
import SettingsBackup from "./Settings-Backup"
import SettingsCommunication from "./Settings-Communication"
import SettingsDownloadOnDemand from "./Settings-DownloadOnDemand"

export function SettingsChatsAndMedia({
    state,
    desktopSettings,
    handleDeltaSettingsChange,
    renderDeltaSwitch2,
    renderDTSettingSwitch
}: {
    state: SettingsState,
    desktopSettings: DesktopSettingsType,
    handleDeltaSettingsChange: any
    renderDeltaSwitch2: RenderDeltaSwitch2Type,
    renderDTSettingSwitch: RenderDTSettingSwitchType
}) {
  const tx = window.static_translate

    return (
    <>
        <SettingsCommunication
            handleDeltaSettingsChange={handleDeltaSettingsChange}
            settings={state.settings}
        />
        {renderDTSettingSwitch({
            key: 'enterKeySends',
            label: tx('pref_enter_sends_explain'),
        })}
        <SettingsDownloadOnDemand
            handleDeltaSettingsChange={handleDeltaSettingsChange}
            settings={state.settings}
        />
        <br />
        <br />
        <H5>{tx('pref_privacy')}</H5>
        {renderDeltaSwitch2({
            key: 'mdns_enabled', 
            label: tx('pref_read_receipts')
        })}
        <br />
        <br />
        <H5>{tx('pref_notifications')}</H5>
        {renderDTSettingSwitch({
            key: 'notifications',
            label: tx('pref_notifications_explain'),
        })}
        {renderDTSettingSwitch({
            key: 'showNotificationContent',
            label: tx('pref_show_notification_content_explain'),
            disabled: !desktopSettings['notifications'],
        })}
        <br />
        <br />
        <SettingsAutodelete
            handleDeltaSettingsChange={handleDeltaSettingsChange}
            settings={state.settings}
        />
        <br />
        <br />
        <SettingsBackup />
      </>
    )
}