import React from 'react'
import { RenderDeltaSwitch2Type, SettingsState } from './Settings'
import SettingsEncryption from './Settings-Encryption'
import SettingsImapFolderHandling from './Settings-ImapFolderHandling'
import SettingsManageKeys from './Settings-ManageKeys'

export function SettingsAdvanced({
  state,
  renderDeltaSwitch2,
}: {
  state: SettingsState
  renderDeltaSwitch2: RenderDeltaSwitch2Type
}) {
  return (
    <>
      <SettingsEncryption renderDeltaSwitch2={renderDeltaSwitch2} />
      <br />
      <br />
      <SettingsImapFolderHandling
        state={state}
        renderDeltaSwitch2={renderDeltaSwitch2}
      />
      <br />
      <br />
      <SettingsManageKeys />
    </>
  )
}
