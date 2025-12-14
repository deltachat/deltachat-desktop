import React from 'react'

import type { SettingsStoreState } from '../../stores/settings'
import CoreSettingsSwitch from './CoreSettingsSwitch'
import useTranslationFunction from '../../hooks/useTranslationFunction'
import ShowClassicEmail from './ShowClassicEmail'

type Props = {
  settingsStore: SettingsStoreState
}

export default function ImapFolderHandling({ settingsStore }: Props) {
  const tx = useTranslationFunction()
  const disableIfOnlyFetchMvBoxIsTrue =
    settingsStore.settings.only_fetch_mvbox === '1'

  return (
    <>
      <ShowClassicEmail settingsStore={settingsStore} />
      <CoreSettingsSwitch
        label={tx('pref_auto_folder_moves')}
        settingsKey='mvbox_move'
        disabled={disableIfOnlyFetchMvBoxIsTrue}
        disabledValue={false}
      />
      <CoreSettingsSwitch
        label={tx('pref_only_fetch_mvbox_title')}
        settingsKey='only_fetch_mvbox'
      />
    </>
  )
}
