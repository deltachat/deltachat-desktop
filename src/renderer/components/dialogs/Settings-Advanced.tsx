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
      <H5>{tx('pref_experimental_features')}</H5>
      <SettingsExperimentalFeatures
        settingsStore={settingsStore}
        renderDTSettingSwitch={renderDTSettingSwitch}
        renderDeltaSwitch2={renderDeltaSwitch2}
      />
    </>
  )
}
