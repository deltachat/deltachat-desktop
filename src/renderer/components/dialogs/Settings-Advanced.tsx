import React from 'react'
import { SettingsStoreState } from '../../stores/settings'
import { RenderDeltaSwitch2Type, RenderDTSettingSwitchType } from './Settings'
import SettingsEncryption from './Settings-Encryption'
import SettingsImapFolderHandling from './Settings-ImapFolderHandling'
import SettingsManageKeys from './Settings-ManageKeys'

export function SettingsAdvanced({
  settingsStore,
  renderDeltaSwitch2,
  renderDTSettingSwitch,
}: {
  settingsStore: SettingsStoreState
  renderDeltaSwitch2: RenderDeltaSwitch2Type
  renderDTSettingSwitch: RenderDTSettingSwitchType
}) {
  return (
    <>
      <SettingsEncryption renderDeltaSwitch2={renderDeltaSwitch2} />
      <br />
      <br />
      <SettingsImapFolderHandling
        settingsStore={settingsStore}
        renderDeltaSwitch2={renderDeltaSwitch2}
      />
      <br />
      <br />
      <SettingsManageKeys />
      <br />
      <br />
      <SettingsTrayIcon
        settingsStore={settingsStore}
        renderDTSettingSwitch={renderDTSettingSwitch}
      />
    </>
  )
}

function SettingsTrayIcon({
  settingsStore,
  renderDTSettingSwitch,
}: {
  settingsStore: SettingsStoreState
  renderDTSettingSwitch: RenderDTSettingSwitchType
}) {
  const tx = window.static_translate
  return (
    <>
      <h5 className='heading'>{tx('pref_system_integration_menu_title')}</h5>
      {renderDTSettingSwitch({
        key: 'minimizeToTray',
        label: tx('pref_show_tray_icon'),
        disabled: settingsStore.rc.minimized,
        disabledValue: settingsStore.rc.minimized,
      })}
      {settingsStore.rc.minimized && (
        <div className='bp4-callout'>
          {tx('explain_desktop_minimized_disabled_tray_pref')}
        </div>
      )}
    </>
  )
}
