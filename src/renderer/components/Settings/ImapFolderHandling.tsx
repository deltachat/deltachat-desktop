import React from 'react'

import { SettingsStoreState } from '../../stores/settings'
import { useTranslationFunction } from '../../contexts'
import CoreSettingsSwitch from './CoreSettingsSwitch'

type Props = {
  settingsStore: SettingsStoreState
}

export default function ImapFolderHandling({ settingsStore }: Props) {
  const tx = useTranslationFunction()
  const disableIfOnlyFetchMvBoxIsTrue =
    settingsStore.settings.only_fetch_mvbox === '1'

  return (
    <>
      <CoreSettingsSwitch
        label={tx('pref_watch_sent_folder')}
        settingsKey='sentbox_watch'
        disabled={disableIfOnlyFetchMvBoxIsTrue}
        disabledValue={false}
      />
      <CoreSettingsSwitch
        label={tx('pref_send_copy_to_self')}
        settingsKey='bcc_self'
        description={tx('pref_send_copy_to_self_explain')}
      />
      <CoreSettingsSwitch
        label={tx('pref_auto_folder_moves')}
        settingsKey='mvbox_move'
        description={tx('pref_auto_folder_moves_explain')}
        disabled={disableIfOnlyFetchMvBoxIsTrue}
        disabledValue={false}
      />
      <CoreSettingsSwitch
        label={tx('pref_only_fetch_mvbox_title')}
        settingsKey='only_fetch_mvbox'
        description={tx('pref_only_fetch_mvbox_explain')}
      />
    </>
  )
}
