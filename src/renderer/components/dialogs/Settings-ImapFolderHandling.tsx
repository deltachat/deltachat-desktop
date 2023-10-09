import React from 'react'
import { H5 } from '@blueprintjs/core'

import { RenderDeltaSwitch2Type } from './Settings'
import { SettingsStoreState } from '../../stores/settings'

export default function SettingsImapFolderHandling({
  settingsStore,
  renderDeltaSwitch2,
}: {
  settingsStore: SettingsStoreState
  renderDeltaSwitch2: RenderDeltaSwitch2Type
}) {
  const tx = window.static_translate
  const disableIfOnlyFetchMvBoxIsTrue =
    settingsStore.settings.only_fetch_mvbox === '1'

  return (
    <>
      <H5>{tx('pref_imap_folder_handling')}</H5>
      {renderDeltaSwitch2({
        label: tx('pref_watch_sent_folder'),
        key: 'sentbox_watch',
        disabled: disableIfOnlyFetchMvBoxIsTrue,
        disabledValue: false,
      })}
      {renderDeltaSwitch2({
        label: tx('pref_send_copy_to_self'),
        key: 'bcc_self',
        description: tx('pref_send_copy_to_self_explain'),
      })}
      {renderDeltaSwitch2({
        label: tx('pref_auto_folder_moves'),
        key: 'mvbox_move',
        description: tx('pref_auto_folder_moves_explain'),
        disabled: disableIfOnlyFetchMvBoxIsTrue,
        disabledValue: false,
      })}
      {renderDeltaSwitch2({
        label: tx('pref_only_fetch_mvbox_title'),
        key: 'only_fetch_mvbox',
        description: tx('pref_only_fetch_mvbox_explain'),
      })}
      {renderDeltaSwitch2({
        label: tx('pref_disable_idle_title'),
        key: 'disable_idle',
        description: tx('pref_disable_idle_explain'),
      })}
    </>
  )
}
