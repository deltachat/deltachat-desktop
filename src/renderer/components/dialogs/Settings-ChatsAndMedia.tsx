import { H5 } from '@blueprintjs/core'
import React from 'react'
import {
  RenderDeltaSwitch2Type,
  RenderDTSettingSwitchType,
  SettingsState,
} from './Settings'
import SettingsAutodelete from './Settings-Autodelete'
import SettingsBackup from './Settings-Backup'
import SettingsCommunication from './Settings-Communication'
import SettingsDownloadOnDemand from './Settings-DownloadOnDemand'
import {
  enterKeySendsKeyboardShortcuts,
  KeybordShortcutHintInSettings,
} from '../KeyboardShortcutHint'
import { DesktopSettingsType } from '../../../shared/shared-types'
import { SettingsStoreState } from '../../stores/settings'

export function SettingsChatsAndMedia({
  settingsStore,
  desktopSettings,
  renderDeltaSwitch2,
  renderDTSettingSwitch,
}: {
  settingsStore: SettingsStoreState
  desktopSettings: DesktopSettingsType
  renderDeltaSwitch2: RenderDeltaSwitch2Type
  renderDTSettingSwitch: RenderDTSettingSwitchType
}) {
  const tx = window.static_translate

  return (
    <>
      <SettingsCommunication settingsStore={settingsStore} />
      {renderDTSettingSwitch({
        key: 'enterKeySends',
        label: tx('pref_enter_sends_explain'),
      })}
      <KeybordShortcutHintInSettings
        actions={enterKeySendsKeyboardShortcuts(
          desktopSettings['enterKeySends']
        )}
      />
      <SettingsDownloadOnDemand settings={settingsStore.settings} />
      <br />
      <br />
      <H5>{tx('pref_privacy')}</H5>
      {renderDeltaSwitch2({
        key: 'mdns_enabled',
        label: tx('pref_read_receipts'),
      })}
      <br />
      <br />
      <SettingsAutodelete settingsStore={settingsStore} />
      <br />
      <br />
      <SettingsBackup />
    </>
  )
}
