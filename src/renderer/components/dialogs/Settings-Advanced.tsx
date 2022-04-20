import React from 'react'
import { SettingsStoreState } from '../../stores/settings'
import { RenderDeltaSwitch2Type } from './Settings'
import SettingsEncryption from './Settings-Encryption'
import SettingsImapFolderHandling from './Settings-ImapFolderHandling'
import SettingsManageKeys from './Settings-ManageKeys'

export function SettingsAdvanced({
  settingsStore,
  renderDeltaSwitch2,
}: {
  settingsStore: SettingsStoreState
  renderDeltaSwitch2: RenderDeltaSwitch2Type
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
    </>
  )
}
