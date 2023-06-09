import { H5 } from '@blueprintjs/core'
import React from 'react'
import { SettingsStoreState } from '../../stores/settings'
import { RenderDeltaSwitch2Type, RenderDTSettingSwitchType } from './Settings'
import SettingsEncryption from './Settings-Encryption'
import { SettingsExperimentalFeatures } from './Settings-ExperimentalFeatures'
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
  const tx = window.static_translate
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
      <br />
      <br />
      <H5>{tx('pref_experimental_features')}</H5>
      <SettingsExperimentalFeatures
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
      <H5>{tx('pref_system_integration_menu_title')}</H5>
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
