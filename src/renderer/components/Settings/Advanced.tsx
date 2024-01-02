import React from 'react'

import Encryption from './Encryption'
import { ExperimentalFeatures } from './ExperimentalFeatures'
import ImapFolderHandling from './ImapFolderHandling'
import ManageKeys from './ManageKeys'
import SettingsHeading from './SettingsHeading'
import SettingsSeparator from './SettingsSeparator'
import useTranslationFunction from '../../hooks/useTranslationFunction'

import type { SettingsStoreState } from '../../stores/settings'

type Props = {
  settingsStore: SettingsStoreState
}

export default function Advanced({ settingsStore }: Props) {
  const tx = useTranslationFunction()

  return (
    <>
      <SettingsHeading>{tx('autocrypt')}</SettingsHeading>
      <Encryption />
      <SettingsSeparator />
      <SettingsHeading>{tx('pref_imap_folder_handling')}</SettingsHeading>
      <ImapFolderHandling settingsStore={settingsStore} />
      <SettingsSeparator />
      <SettingsHeading>{tx('pref_managekeys_menu_title')}</SettingsHeading>
      <ManageKeys />
      <SettingsSeparator />
      <SettingsHeading>{tx('pref_experimental_features')}</SettingsHeading>
      <ExperimentalFeatures settingsStore={settingsStore} />
    </>
  )
}
